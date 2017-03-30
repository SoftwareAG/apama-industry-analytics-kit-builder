import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {Injectable} from "@angular/core";
import {AbstractTransformerPropertyService} from "../../services/AbstractTransformerPropertyService";
import {Property} from "../../classes/Property";
import {TransformerPropertySelectorComponent} from "./transformer-property-selector.component";

@Injectable()
class SynchronousTransformerPropertyServiceMock implements AbstractTransformerPropertyService  {
  //noinspection JSMethodCanBeStatic
  getTransformerProperties() {
    return [
      Property.fromObject({
        name: 'decimalProperty_required',
        type: 'decimal',
        optional: false,
        value: 2.0
      }),
      Property.fromObject({
        name: 'integerProperty_required',
        type: 'integer',
        optional: false,
        value: 5
      }),
      Property.fromObject({
        name: 'floatProperty_required',
        type: 'float',
        optional: false,
        value: 5
      }),
      Property.fromObject({
        name: 'booleanProperty_required',
        type: 'boolean',
        optional: false,
        value: true
      }),
      Property.fromObject({
        name: 'stringProperty_required',
        type: 'string',
        optional: false,
        value: "Test String"
      }),
      Property.fromObject({
        name: 'decimalProperty_optional',
        type: 'decimal',
        optional: true
      }),
      Property.fromObject({
        name: 'integerProperty_optional',
        type: 'integer',
        optional: true
      }),
      Property.fromObject({
        name: 'floatProperty_optional',
        type: 'float',
        optional: true
      }),
      Property.fromObject({
        name: 'booleanProperty_optional',
        type: 'boolean',
        optional: true
      }),
      Property.fromObject({
        name: 'stringProperty_optional',
        type: 'string',
        optional: true
      })
    ]
  };

  withTransformerProperties(callback: (transformerProperties: Property[]) => void) {
    callback(this.getTransformerProperties());
  }
}

describe('TransformerPropertySelectorComponent', () => {
  let component: TransformerPropertySelectorComponent;
  let fixture: ComponentFixture<TransformerPropertySelectorComponent>;
  let el: HTMLElement;
  let transformerPropertyService: AbstractTransformerPropertyService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransformerPropertySelectorComponent ],
      providers: [
        {provide: AbstractTransformerPropertyService, useClass: SynchronousTransformerPropertyServiceMock}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransformerPropertySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
    transformerPropertyService = TestBed.get(AbstractTransformerPropertyService);
  });

  it('should create transformer property elements', () => {

    // Check that all of the transformer properties have rendered into the DOM
    expect(el.querySelectorAll('.transformer-property').length).toEqual(10);

    // Get the data so we can compare it against the DOM elements
    const transformerProperties = transformerPropertyService.getTransformerProperties();
    Array.from(el.querySelectorAll('.transformer-property-name')).forEach((transformerPropertyEl, i) => {
      let text: string = transformerPropertyEl.textContent || "";
      switch(transformerProperties[i].type) {
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
      expect(text).toEqual(transformerProperties[i].name);
    });
  });
});
