import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {TransformerSelectorComponent} from "./transformer-selector.component";
import {Injectable} from "@angular/core";
import {AbstractDragService, Draggable, Dragged, Point} from "../../services/AbstractDragService";
import {AbstractMetadataService} from "../../services/MetadataService";
import {MetadataBuilder, MetadataJsonInterface} from "../../classes/Metadata";

@Injectable()
class MetadataServiceMock extends AbstractMetadataService {
  loadMetadata(json: MetadataJsonInterface) {
    throw new Error('Method not implemented.');
  }
}

@Injectable()
class DragServiceMock extends AbstractDragService {
  startDrag(draggable: Draggable) {}
  stopDrag(): Dragged | undefined { return undefined; }
  drag(newLocation: Point) {}
}

describe('TransformerSelectorComponent', () => {
  let component: TransformerSelectorComponent;
  let fixture: ComponentFixture<TransformerSelectorComponent>;
  let el: HTMLElement;
  let metadataService: MetadataServiceMock;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransformerSelectorComponent ],
      providers: [
        {provide: AbstractMetadataService, useClass: MetadataServiceMock},
        {provide: AbstractDragService, useClass: DragServiceMock}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    metadataService = TestBed.get(AbstractMetadataService) as MetadataServiceMock;
    fixture = TestBed.createComponent(TransformerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
  });

  it('should have an svg child element', () => {
    expect(el.children[0].nodeName).toEqual('svg');
  });

  it('should create transformer elements', () => {
    const metadata = new MetadataBuilder()
      .withAnalytic().Name("MyFirstAnalytic").endWith()
      .withAnalytic().Name("MySecondAnalytic").endWith()
      .build();
    metadataService.metadata.next(metadata);
    const textContents = Array.from(el.querySelectorAll('.transformer')).map((transformerEl) => {
      return (transformerEl.querySelector('text') as Element).textContent;
    });
    expect(textContents).toEqual(['MyFirstAnalytic', 'MySecondAnalytic'])
  });
});
