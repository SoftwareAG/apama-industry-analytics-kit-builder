import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {TransformerSelectorComponent} from "./transformer-selector.component";
import {Injectable} from "@angular/core";
import {AbstractDataService} from "../../services/AbstractDataService";
import {BehaviorSubject, Observable} from "rxjs";
import {TransformerDef} from "../../classes/TransformerDef";
import {Channel} from "../../classes/Channel";
import {Config} from "../../classes/Config";

@Injectable()
class DataServiceMock implements AbstractDataService {
  private _transformers: BehaviorSubject<TransformerDef[]> = new BehaviorSubject([]);

  readonly channels: Observable<Channel[]>;
  readonly transformers: Observable<TransformerDef[]> = this._transformers.asObservable();
  readonly hierarchy: Observable<Config>;

  updateTransformers(transformers: TransformerDef[]) {
    this._transformers.next(transformers);
  }
}

fdescribe('TransformerSelectorComponent', () => {
  let component: TransformerSelectorComponent;
  let fixture: ComponentFixture<TransformerSelectorComponent>;
  let el: HTMLElement;
  let dataService: DataServiceMock;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransformerSelectorComponent ],
      providers: [
        {provide: AbstractDataService, useClass: DataServiceMock}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    dataService = TestBed.get(AbstractDataService) as DataServiceMock;
    fixture = TestBed.createComponent(TransformerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
  });

  it('should have an svg child element', () => {
    expect(el.children[0].nodeName).toEqual('svg');
  });

  it('should create transformer elements', () => {
    const transformers = [{
      name: "MyFirstAnalytic",
      properties: [{ name: "Property1", description: "validDescription1", optional: true, type: "integer" as "integer" }]
    },{
      name: "MySecondAnalytic",
      properties: [{ name: "Property1", description: "validDescription1", optional: true, type: "integer" as "integer" }]
    }].map(transDefObj => { return new TransformerDef(transDefObj)});
    dataService.updateTransformers(transformers);
    expect(el.querySelectorAll('.transformer').length).toEqual(2);
    Array.from(el.querySelectorAll('.transformer')).forEach((transformerEl, i) => {
      expect((transformerEl.querySelector('text') as Element).textContent).toEqual(transformers[i].name);
    });
  });
});
