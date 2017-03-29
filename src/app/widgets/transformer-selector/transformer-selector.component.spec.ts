import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {TransformerSelectorComponent} from "./transformer-selector.component";
import {Injectable} from "@angular/core";
import {AbstractDataService} from "../../services/AbstractDataService";
import {BehaviorSubject, Observable} from "rxjs";
import {TransformerDef, TransformerDefArrayBuilder} from "../../classes/TransformerDef";
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

describe('TransformerSelectorComponent', () => {
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
    const transformers = new TransformerDefArrayBuilder()
      .with().Name("MyFirstAnalytic").endWith()
      .with().Name("MySecondAnalytic").endWith()
      .build();
    dataService.updateTransformers(transformers);
    const textContents = Array.from(el.querySelectorAll('.transformer')).map((transformerEl) => {
      return (transformerEl.querySelector('text') as Element).textContent;
    });
    expect(textContents).toEqual(['MyFirstAnalytic', 'MySecondAnalytic'])
  });
});
