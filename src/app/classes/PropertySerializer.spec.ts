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

  it('should handle an empty Property', () => {
    const property = new PropertyBuilder()
      .build();

    const result = propertySerializer.toApama(property.toJson());
    expect(result).toBe('')
  });

  describe("Should process property types correctly", () => {
    [
      {
        type : "string",
        optional: false,
        value : 'StringData',
        result: '"testCase":"StringData"'
      },
      {
        type : "string",
        optional: true,
        value : 'StringData',
        result: '"testCase":"StringData"'
      },
      {
        type : "string",
        optional: true,
        value: undefined,
        result: ''
      },
      {
        type : "float",
        optional: false,
        value : 12.2,
        result: '"testCase":"12.2f"'
      },
      {
        type : "float",
        optional: true,
        value : 12.2,
        result: '"testCase":"12.2f"'
      },
      {
        type : "float",
        optional: true,
        value: undefined,
        result: ''
      },
      {
        type : "decimal",
        optional: false,
        value : 15.4,
        result: '"testCase":"15.4d"'
      },
      {
        type : "decimal",
        optional: true,
        value : 15.4,
        result: '"testCase":"15.4d"'
      },
      {
        type : "decimal",
        optional: true,
        value: undefined,
        result: ''
      },
      {
        type : "integer",
        optional: false,
        value : 10,
        result: '"testCase":"10"'
      },
      {
        type : "integer",
        optional: true,
        value : 10,
        result: '"testCase":"10"'
      },
      {
        type : "integer",
        optional: true,
        value: undefined,
        result: ''
      },
      {
        type : "boolean",
        optional: false,
        value : true,
        result: '"testCase":"true"'
      },
      {
        type : "boolean",
        optional: true,
        value : true,
        result: '"testCase":"true"'
      },
      {
        type : "boolean",
        optional: true,
        value: undefined,
        result: ''
      },
      {
        type: "boolean",
        optional: false,
        value: false,
        result: '"testCase":"false"'
      },
      {
        type : "boolean",
        optional: true,
        value : false,
        result: '"testCase":"false"'
      },
      {
        type : "boolean",
        optional: true,
        value: undefined,
        result: ''
      }
    ].forEach((testCase) => {

        const property = new PropertyBuilder()
          .Name(`testCase`)
          .Type(testCase.type as "integer" | "string" | "float" | "decimal" | "boolean")
          .Optional(testCase.optional)
          .Value(testCase.value)
          .build();

        it(`PropertyType : ${jasmine.pp(testCase)}`, () => {
          const serialisedData = propertySerializer.toApama(property.toJson());
          expect(serialisedData).toEqual(
            testCase.result
          );
        })
      })
  });
});

