import {SandboxEvalComponent} from "../widgets/sandbox-eval/sandbox-eval.component";

export class SandboxEvalService {
  private sandboxEvalComponent: Promise<SandboxEvalComponent>;
  private resolveSandboxEvalComponent: (value: SandboxEvalComponent) => void;
  private mostRecentEvalCall: Promise<any>;

  constructor() {
    this.sandboxEvalComponent = new Promise((resolve) => {
      this.resolveSandboxEvalComponent = resolve;
    });
    this.mostRecentEvalCall = this.sandboxEvalComponent;
  }

  registerComponent(sandboxEval: SandboxEvalComponent) {
    this.resolveSandboxEvalComponent(sandboxEval);
  }

  eval(funcString: string, value: number | string | boolean): Promise<any> {
    // Queue all requests, the iframe can only handle them synchronously
    return this.mostRecentEvalCall = this.mostRecentEvalCall
      .catch(() => {}) // Ignore failures in previous eval calls
      .then(() => this.sandboxEvalComponent)
      .then(sandboxEvalComponent => sandboxEvalComponent.updateFunction(funcString))
      .then(sandboxEvalComponent => sandboxEvalComponent.execute(value));
  }
}
