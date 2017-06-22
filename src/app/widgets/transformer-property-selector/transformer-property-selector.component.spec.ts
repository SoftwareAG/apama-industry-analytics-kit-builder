import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {TransformerPropertySelectorComponent} from "./transformer-property-selector.component";
import {Transformer, TransformerBuilder} from "../../classes/Transformer";
import {Injectable} from "@angular/core";
import {AbstractDataService} from "../../services/AbstractDataService";
import {FormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {MetadataBuilder} from "../../classes/Metadata";
import {AbstractMetadataService, MetadataService} from "../../services/MetadataService";
import {SelectionService} from "../../services/SelectionService";

@Injectable()
class DataServiceMock extends AbstractDataService {
  addAnalyticChannelsToChannelsPanel(transformer: Transformer) {};
  removeAnalyticChannelsFromChannelsPanel(transformer: Transformer) {};
  addChannel(channelName: string) {};
  setModified(modifiedValue: boolean) {};
  isModified(): boolean { return false};
}

describe('TransformerPropertySelectorComponent', () => {
  let selectionService: SelectionService;
  let dataService: DataServiceMock;
  let metadataService: MetadataService;
  let component: TransformerPropertySelectorComponent;
  let fixture: ComponentFixture<TransformerPropertySelectorComponent>;
  let el: HTMLElement;

  const testMetadata = new MetadataBuilder()
    .withAnalytic()
      .Name("Analytic1")
      .withProperty()
        .Name('decimalProperty_required')
        .Description('decimalPropertyDescription')
        .Type('decimal')
        .Optional(false)
        .endWith()
      .withProperty()
        .Name('integerProperty_required')
        .Description('integerPropertyDescription')
        .Type('integer')
        .Optional(false)
        .endWith()
      .withProperty()
        .Name('floatProperty_required')
        .Description('floatPropertyDescription')
        .Type('float')
        .Optional(false)
        .endWith()
      .withProperty()
        .Name('booleanProperty_required')
        .Description('booleanPropertyDescription')
        .Type('boolean')
        .Optional(false)
        .endWith()
      .withProperty()
        .Name('stringProperty_required')
        .Description('stringPropertyDescription')
        .Type('string')
        .Optional(false)
        .endWith()
      .withProperty()
        .Name('decimalProperty_optional')
        .Description('decimalPropertyDescription')
        .Type('decimal')
        .Optional(true)
        .endWith()
      .withProperty()
        .Name('integerProperty_optional')
        .Description('integerPropertyDescription')
        .Type('integer')
        .Optional(true)
        .endWith()
      .withProperty()
        .Name('floatProperty_optional')
        .Description('floatPropertyDescription')
        .Type('float')
        .Optional(true)
        .endWith()
      .withProperty()
        .Name('booleanProperty_optional')
        .Description('booleanPropertyDescription')
        .Type('boolean')
        .Optional(true)
        .endWith()
      .withProperty()
        .Name('stringProperty_optional')
        .Description('stringPropertyDescription')
        .Type('string')
        .Optional(true)
        .endWith()
      .endWith()
    .build();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransformerPropertySelectorComponent ],
      providers: [
        {provide: AbstractDataService, useClass: DataServiceMock},
        {provide: AbstractMetadataService, useClass: MetadataService},
        SelectionService
      ],
      imports: [
        FormsModule,
        NgbModule.forRoot()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    selectionService = TestBed.get(SelectionService) as SelectionService;
    dataService = TestBed.get(AbstractDataService) as DataServiceMock;
    metadataService = TestBed.get(AbstractMetadataService) as MetadataService;
    fixture = TestBed.createComponent(TransformerPropertySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
  });

  it('should create transformer property elements', () => {
    const transformer = new TransformerBuilder()
      .Name("Analytic1")
      .withPropertyValue().NameAndDef('decimalProperty_required').Value(2.0).endWith()
      .withPropertyValue().NameAndDef('integerProperty_required').Value(5).endWith()
      .withPropertyValue().NameAndDef('floatProperty_required').Value(5).endWith()
      .withPropertyValue().NameAndDef('booleanProperty_required').Value(true).endWith()
      .withPropertyValue().NameAndDef('stringProperty_required').Value("Test String").endWith()
      .withPropertyValue().NameAndDef('decimalProperty_optional').endWith()
      .withPropertyValue().NameAndDef('integerProperty_optional').endWith()
      .withPropertyValue().NameAndDef('floatProperty_optional').endWith()
      .withPropertyValue().NameAndDef('booleanProperty_optional').endWith()
      .withPropertyValue().NameAndDef('stringProperty_optional').endWith()
      .build();

    metadataService.metadata.next(testMetadata);
    selectionService.selection.next(transformer);

    fixture.detectChanges();

    // Check that all of the transformer properties have rendered into the DOM
    expect((el.querySelector('.content') as Element).children.length).toEqual(10);

    // Get the data so we can compare it against the DOM elements
    Array.from(el.querySelectorAll('h6')).forEach((transformerPropertyEl, i) => {
      expect(transformerPropertyEl.textContent).toEqual(testMetadata.getAnalytic("Analytic1").properties.get(i).name);
    });
  });
});
