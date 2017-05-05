import {TransformerSerializer} from "app/classes/Transformer";
import {PropertyBuilder, PropertySerializer} from "./Property";
import {TestBed} from "@angular/core/testing";

describe('PropertySerializer', () => {

  let propertySerializer: PropertySerializer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TransformerSerializer,
        PropertySerializer
      ]
    });
    propertySerializer = TestBed.get(PropertySerializer) as PropertySerializer;
  });

  describe("Should process property types correctly", () => {
    [
      {
        type : "string",
        value : 'StringData',
        result: '"testCase":"StringData"'
      }, {
        type : "float",
        value : 12.2,
        result: '"testCase":"12.2f"'
      }, {
        type : "float",
        value : 12,
        result: '"testCase":"12.0f"'
      }, {
        type : "float",
        value : 0,
        result: '"testCase":"0.0f"'
      }, {
        type : "float",
        value : -12.2,
        result: '"testCase":"-12.2f"'
      }, {
        type : "decimal",
        value : 15.4,
        result: '"testCase":"15.4d"'
      }, {
        type : "decimal",
        value : 15,
        result: '"testCase":"15.0d"'
      }, {
        type : "decimal",
        value : 0,
        result: '"testCase":"0.0d"'
      }, {
        type : "decimal",
        value : -15.4,
        result: '"testCase":"-15.4d"'
      }, {
        type : "integer",
        value : 10,
        result: '"testCase":"10"'
      }, {
        type : "integer",
        value : 0,
        result: '"testCase":"0"'
      }, {
        type : "integer",
        value : -10,
        result: '"testCase":"-10"'
      }, {
        type : "boolean",
        value : true,
        result: '"testCase":"true"'
      }, {
        type : "boolean",
        value : false,
        result: '"testCase":"false"'
      }
    ].forEach((testCase) => {
        const property = new PropertyBuilder()
          .Name('testCase')
          .DefinitionName('testCase')
          .Value(testCase.value)
          .build();

        it(`PropertyType : ${jasmine.pp(testCase)}`, () => {
          const serialisedData = propertySerializer.toApama(property.toJson(), testCase.type as "integer" | "string" | "float" | "decimal" | "boolean");
          expect(serialisedData).toEqual(
            testCase.result
          );
        })
      })
  });
});

