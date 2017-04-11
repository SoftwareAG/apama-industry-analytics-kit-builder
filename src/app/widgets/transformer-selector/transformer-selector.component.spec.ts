import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {TransformerSelectorComponent} from "./transformer-selector.component";
import {Injectable} from "@angular/core";
import {AbstractDataService} from "../../services/AbstractDataService";
import {BehaviorSubject} from "rxjs";
import {TransformerDef, TransformerDefArrayBuilder} from "../../classes/TransformerDef";
import {Channel} from "../../classes/Channel";
import {Config} from "../../classes/Config";
import {List} from "immutable";
import {Transformer} from "../../classes/Transformer";
import {AbstractDragService, Draggable, Dragged, Point} from "../../services/AbstractDragService";

@Injectable()
class DataServiceMock implements AbstractDataService {
  readonly configurations: BehaviorSubject<List<Config>>;

  readonly channels: BehaviorSubject<List<Channel>>;
  readonly transformers: BehaviorSubject<List<TransformerDef>> = new BehaviorSubject(List<TransformerDef>());
  readonly hierarchy: BehaviorSubject<Config>;
  readonly selectedTransformer: BehaviorSubject<Transformer | undefined>;
}

@Injectable()
class DragServiceMock implements AbstractDragService {
  dragging: BehaviorSubject<Dragged | undefined>;

  startDrag(draggable: Draggable) {}
  stopDrag(): Dragged | undefined { return undefined; }
  drag(newLocation: Point) {}
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
        {provide: AbstractDataService, useClass: DataServiceMock},
        {provide: AbstractDragService, useClass: DragServiceMock}
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
    const transformers = List(new TransformerDefArrayBuilder()
      .with().Name("MyFirstAnalytic").endWith()
      .with().Name("MySecondAnalytic").endWith()
      .build());
    dataService.transformers.next(transformers);
    const textContents = Array.from(el.querySelectorAll('.transformer')).map((transformerEl) => {
      return (transformerEl.querySelector('text') as Element).textContent;
    });
    expect(textContents).toEqual(['MyFirstAnalytic', 'MySecondAnalytic'])
  });
});
