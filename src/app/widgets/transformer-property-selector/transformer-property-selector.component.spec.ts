import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {TransformerPropertySelectorComponent} from "./transformer-property-selector.component";
import {Transformer, TransformerBuilder} from "../../classes/Transformer";
import {Injectable} from "@angular/core";
import {AbstractDataService} from "../../services/AbstractDataService";
import {BehaviorSubject} from "rxjs";
import {Config} from "../../classes/Config";
import {Channel} from "../../classes/Channel";
import {FormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {List} from "immutable";

@Injectable()
class DataServiceMock extends AbstractDataService {}

describe('TransformerPropertySelectorComponent', () => {
  let dataService: DataServiceMock;
  let component: TransformerPropertySelectorComponent;
  let fixture: ComponentFixture<TransformerPropertySelectorComponent>;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransformerPropertySelectorComponent ],
      providers: [
        {provide: AbstractDataService, useClass: DataServiceMock}
      ],
      imports: [
        FormsModule,
        NgbModule.forRoot()
      ]

    }).compileComponents();
  }));

  beforeEach(() => {
    dataService = TestBed.get(AbstractDataService) as DataServiceMock;
    fixture = TestBed.createComponent(TransformerPropertySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
  });

  it('should create transformer property elements', () => {

    const transformer = getTransformer();
    dataService.selectedTransformer.next(transformer);
    fixture.detectChanges();

    // Check that all of the transformer properties have rendered into the DOM
    expect(el.children.length).toEqual(10);

    // Get the data so we can compare it against the DOM elements
    Array.from(el.querySelectorAll('h6')).forEach((transformerPropertyEl, i) => {
      expect(transformerPropertyEl.textContent).toEqual(transformer.properties.get(i).name);
    });
  });
});

function getTransformer(): Transformer {
  return new TransformerBuilder()
    .withPopulatedProperty()
      .Name('decimalProperty_required')
      .Description('decimalPropertyDescription')
      .Type('decimal')
      .Optional(false)
      .Value(2.0)
      .endWith()
    .withPopulatedProperty()
      .Name('integerProperty_required')
      .Description('integerPropertyDescription')
      .Type('integer')
      .Optional(false)
      .Value(5)
      .endWith()
    .withPopulatedProperty()
      .Name('floatProperty_required')
      .Description('floatPropertyDescription')
      .Type('float')
      .Optional(false)
      .Value(5)
      .endWith()
    .withPopulatedProperty()
      .Name('booleanProperty_required')
      .Description('booleanPropertyDescription')
      .Type('boolean')
      .Optional(false)
      .Value(true)
      .endWith()
    .withPopulatedProperty()
      .Name('stringProperty_required')
      .Description('stringPropertyDescription')
      .Type('string')
      .Optional(false)
      .Value("Test String")
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
    .build()
}
