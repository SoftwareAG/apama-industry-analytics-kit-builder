import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {SandboxEvalComponent} from "./sandbox-eval.component";
import {Component, ViewChild} from "@angular/core";
import {SandboxEvalService} from "../../services/SandboxEvalService";

// Needs a wrapper component so that ngOnChanges is called
@Component({
  selector: 'sandbox-eval-tester',
  template: '<sandbox-eval></sandbox-eval>'
})
class SandboxEvalTesterComponent {
  @ViewChild(SandboxEvalComponent) sandboxEval: SandboxEvalComponent
}

describe('SandboxEvalComponent', () => {
  let component: SandboxEvalTesterComponent;
  let fixture: ComponentFixture<SandboxEvalTesterComponent>;
  let sandboxEvalService: SandboxEvalService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SandboxEvalComponent,
        SandboxEvalTesterComponent
      ],
      providers: [ SandboxEvalService ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SandboxEvalTesterComponent);
    sandboxEvalService = TestBed.get(SandboxEvalService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    sandboxEvalService.registerComponent(component.sandboxEval);

    // Trigger change detection automatically when updateFunction is called so that the srcdoc of the iframe updates
    const originalFunction = component.sandboxEval.updateFunction;
    spyOn(component.sandboxEval, 'updateFunction').and.callFake(function() {
      const result = originalFunction.apply(component.sandboxEval, arguments);
      fixture.detectChanges();
      return result;
    });
  });

  it('Should correctly handle valid function', (done) => {
    sandboxEvalService.eval("function(a) {return a + a}", 12)
      .then(result => expect(result).toEqual(24))
      .then(done);
  });

  it('Should handle multiple calls with different functions', (done) => {
    Promise.all([
      sandboxEvalService.eval("function(a) {return a + a}", 12)
        .then(result => expect(result).toEqual(24)),
      sandboxEvalService.eval("function(a) {return a * a}", 15)
        .then(result => expect(result).toEqual(225))
    ])
      .then(done);
  });

  it('Should ignore errors in previous evals', (done) => {
    sandboxEvalService.eval("function(a) {throw new Error(\"Force an error in eval function\")}", 12)
      .then(() => {expect(true).toBe(false)})
      .catch(() => {});
    sandboxEvalService.eval("function(a) {return a * a}", 15)
      .then(result => expect(result).toEqual(225))
      .then(done);
  });
});
