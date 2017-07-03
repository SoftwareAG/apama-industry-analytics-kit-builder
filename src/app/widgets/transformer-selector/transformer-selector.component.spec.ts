import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {TransformerSelectorComponent} from "./transformer-selector.component";
import {Injectable} from "@angular/core";
import {AbstractDragService, Draggable, Dragged, Point} from "../../services/AbstractDragService";
import {AbstractMetadataService} from "../../services/MetadataService";
import {MetadataBuilder, MetadataJsonInterface} from "../../classes/Metadata";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {TransformerDefinitionComponent} from "../transformer-definition/transformer-definition.component";
import {TransformerDefJsonInterface} from "../../classes/TransformerDef";

@Injectable()
class MetadataServiceMock extends AbstractMetadataService {
  loadMetadata(json: MetadataJsonInterface) {
    throw new Error('Method not implemented.');
  }

  loadAnalytic(...json: TransformerDefJsonInterface[]) {
    throw new Error('Method not implemented.');
  };

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
      declarations: [
        TransformerSelectorComponent,
        TransformerDefinitionComponent
      ],
      imports: [
        NgbModule.forRoot()
      ],
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

  it('should create groups elements', () => {
    const metadata = new MetadataBuilder()
      .withAnalytic().Group("Group1").Name("MyFirstAnalytic").endWith()
      .withAnalytic().Group("Group2").Name("MySecondAnalytic").endWith()
      .build();
    metadataService.metadata.next(metadata);
    fixture.detectChanges();
    const textContents = Array.from(el.querySelectorAll('a')).map((aEl) => (aEl as any).textContent.trim());
    expect(textContents).toEqual(['Group1', 'Group2'])
  });
});
