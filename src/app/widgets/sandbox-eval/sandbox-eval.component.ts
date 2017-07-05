import {Component, ElementRef, HostBinding, OnChanges, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'sandbox-eval',
  template: '<iframe [srcdoc]="srcdoc" sandbox="allow-scripts" #sandboxIframe></iframe>',
  styleUrls: ['./sandbox-eval.component.scss']
})
export class SandboxEvalComponent {
  timeout = 500;

  @HostBinding('style.position') private position = "absolute";
  @ViewChild('sandboxIframe') private iframe: ElementRef;
  srcdoc: SafeHtml;
  private func: string;

  constructor(private sanitizer: DomSanitizer) {}

  private _updateFunction(funcString: string) {
    this.func = funcString;
    this.srcdoc = this.sanitizer.bypassSecurityTrustHtml(`<script>
      var sandboxedFunc;
      try {
        sandboxedFunc = eval(${JSON.stringify('(' + funcString + ')')});
      } catch(e) {
          // TODO: do something, send an error?
      }
      window.addEventListener("message", function(event) {
        if ("${window.location.origin}" !== event.origin) return;
        window.parent.postMessage(sandboxedFunc(event.data), "${window.location.origin}");
      }, false);
    <\/script>`);
  }

  updateFunction(funcString: string): Promise<this> {
    // Check to see if we've already loaded this function, constructing the iframe content again is slow! ~50ms
    if (this.func === funcString) {
      return Promise.resolve(this);
    } else {
      return new Promise((resolve) => {
        this.iframe.nativeElement.onload = () => resolve(this);
        this._updateFunction(funcString);
      });
    }
  }

  execute(value: any) : Promise<any> {
    return new Promise<any>((resolve, reject) => {
        const responseHandler = (event: MessageEvent) => {
          if ("null" !== event.origin) return;
          if (this.iframe.nativeElement.contentWindow !== event.source) return;
          window.removeEventListener("message", responseHandler);
          resolve(event.data);
        };
        window.addEventListener("message", responseHandler);
        this.iframe.nativeElement.contentWindow.postMessage(value, "*");
        setTimeout(() => {
          window.removeEventListener("message", responseHandler);
          reject("Timed out while waiting for Sandboxed eval");
        }, this.timeout);
      });
  }
}
