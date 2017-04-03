import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {TransformerPropertySelectorComponent} from "./transformer-property-selector.component";
import {Transformer, TransformerBuilder} from "../../classes/Transformer";

describe('TransformerPropertySelectorComponent', () => {
  let component: TransformerPropertySelectorComponent;
  let fixture: ComponentFixture<TransformerPropertySelectorComponent>;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransformerPropertySelectorComponent ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransformerPropertySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
  });

  it('should create transformer property elements', () => {

    const transformer = getTransformer();

    component.transformer = transformer;
    fixture.detectChanges();

    // Check that all of the transformer properties have rendered into the DOM
    expect(el.querySelectorAll('.transformer-property').length).toEqual(10);

    // Get the data so we can compare it against the DOM elements
    Array.from(el.querySelectorAll('.transformer-property-name')).forEach((transformerPropertyEl, i) => {
      let text: string = transformerPropertyEl.textContent || "";
      switch(transformer.properties[i].type) {
        case "decimal":
        case "float":
        case "integer":
        case "boolean":
          text = text.replace(/\n/g, "");
          text = text.trim();
          break;
        case "string":
          text = text.substr(0, text.indexOf('\n'));
          break;
      }
      expect(text).toEqual(transformer.properties[i].name);
    });
  });
});

function getTransformer(): Transformer {
  return new TransformerBuilder()
    .withProperty()
      .Name('decimalProperty_required')
      .Description('decimalPropertyDescription')
      .Type('decimal')
      .Optional(false)
      .Value(2.0)
      .endWith()
    .withProperty()
      .Name('integerProperty_required')
      .Description('integerPropertyDescription')
      .Type('integer')
      .Optional(false)
      .Value(5)
      .endWith()
    .withProperty()
      .Name('floatProperty_required')
      .Description('floatPropertyDescription')
      .Type('float')
      .Optional(false)
      .Value(5)
      .endWith()
    .withProperty()
      .Name('booleanProperty_required')
      .Description('booleanPropertyDescription')
      .Type('boolean')
      .Optional(false)
      .Value(true)
      .endWith()
    .withProperty()
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
