import {PropertyDef, PropertyDefBuilder} from "./PropertyDef";
import {List} from "immutable";
describe('PropertyDef', () => {

  const jsonData = {
    name: 'validName',
    description: 'validDescription',
    type: "string" as "string",
    optional: true,
    validValues: [],
    validator: undefined
  };

  it('should convert valid JSON PropertyDef data into a PropertyDef', () => {
    const propertyDef = PropertyDefBuilder.fromJson(jsonData).build().validate();
    expect(propertyDef.name).toEqual(jsonData.name);
    expect(propertyDef.description).toEqual(jsonData.description);
    expect(propertyDef.type).toEqual(jsonData.type);
    expect(propertyDef.optional).toEqual(jsonData.optional);
  });

  describe("Should throw an error if passed invalid JSON 'name' Data", () => {
    [null, [], {}, ''].forEach((item) => {
      it(`Construction Object: ${item}`, () => {
        expect(() => { PropertyDefBuilder.fromJson( Object.assign({}, jsonData, {name: item})).build().validate(); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if passed invalid JSON 'description' data", () => {
    [null, [], {}, ''].forEach((item) => {
      it(`Invalid "description" data: ${item}`, () => {
        expect(() => { PropertyDefBuilder.fromJson( Object.assign({}, jsonData, {description: item})).build().validate(); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if passed invalid JSON 'type' data", () => {
    [null, [], {}, ''].forEach((item) => {
      it(`Invalid "type" data: ${item}`, () => {
        expect(() => { PropertyDefBuilder.fromJson( Object.assign({}, jsonData, {type: item})).build().validate(); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if passed invalid JSON 'optional' Data", () => {
    [null, [], {}, ''].forEach((item) => {
      it(`Invalid "optional" data: ${item}`, () => {
        expect(() => { PropertyDefBuilder.fromJson( Object.assign({}, jsonData, {type: item})).build().validate(); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if name | description | type is missing from the JSON data", () => {
    ['name', 'description', 'type'].forEach((element) => {
      it(`Missing element: ${element}`, () => {
        let invalidData = Object.assign({}, jsonData);
        delete invalidData[element];
        expect(() => { PropertyDefBuilder.fromJson( invalidData).build().validate(); }).toThrowError();
      })
    });
  });

  it('should be valid if "optional" element is not provided', () => {
    let validJsonData = Object.assign({}, jsonData);
    delete validJsonData['optional'];
    expect(() => { PropertyDefBuilder.fromJson( validJsonData).build().validate(); }).toBeDefined();
  });

  describe('should be valid if "optional" element is provided with boolean values', () => {
    [true, false].forEach((validOptionalValue) => {
      it(`valid Optional Value: ${validOptionalValue}`, () => {
        expect(() => {
          PropertyDefBuilder.fromJson(Object.assign({}, jsonData, {optional: validOptionalValue})).build().validate();
        }).toBeDefined();
      })
    });
  });

  it('should be valid if "defaultValue" element is not provided', () => {
    let validJsonData = Object.assign({}, jsonData);
    expect(() => { PropertyDefBuilder.fromJson( validJsonData).build().validate(); }).toBeDefined();
  });

  describe('should be valid if "defaultValue" element is provided with valid data', () => {
    [true, false, "stringdata", 0, 1, -1, 0.1 ].forEach((validDefaultValue) => {
      it(`valid Default Value: ${validDefaultValue}`, () => {
        expect(() => {
          PropertyDefBuilder.fromJson(Object.assign({}, jsonData, {defaultValue: validDefaultValue})).build().validate();
        }).toBeDefined();
      })
    });
  });

  describe('should be invalid if "defaultValue" element is provided with invalid data', () => {
    [[], {}, null].forEach((invalidDefaultValue) => {
      it(`invalid Default Value: ${invalidDefaultValue}`, () => {
       expect( () => {
         PropertyDefBuilder.fromJson(Object.assign({}, jsonData, {defaultValue: invalidDefaultValue})).build().validate();
       }).toThrowError();
      })
    });
  });

  describe("should coerce optional if provided and type is not boolean", () => {
    [null, {}, '', 1, -1, 0].forEach((optionalValue) => {
      it(`invalid optional value: ${optionalValue}`, () => {
        expect(PropertyDefBuilder.fromJson(Object.assign({}, jsonData, {optional: optionalValue})).build().validate().optional).toEqual(!!optionalValue);
      })
    });
  });

  describe("Should ignore any other elements in the JSON data", () => {
    const validPropertyDef = PropertyDefBuilder.fromJson(Object.assign({}, jsonData)).build();
    [{ a: 'a'}, {b: 2}, {c: true}, {d: {} }].forEach((object) => {
        it(`Ignore :  ${JSON.stringify(object)}`, () => {
          const propertyDef = PropertyDefBuilder.fromJson(Object.assign({}, jsonData, object)).build().validate();
          expect(propertyDef).toEqual(validPropertyDef);
        });
    });
  });

  it('should be undefined if "validValues" is not provided', () => {
    let validJsonData = Object.assign({}, jsonData);
    delete validJsonData['validValues'];
    expect(PropertyDefBuilder.fromJson( validJsonData).build().validate().validValues).toBeUndefined();
  });

  it('should be valid if "validValues" is provided with an empty array', () => {
    let validJsonData = Object.assign({}, jsonData, {validValues: []});
    expect((PropertyDefBuilder.fromJson( validJsonData).build().validValues as List<any>).toArray()).toEqual([]);
  });

  describe('should error if "validValue" is provided with invalid data', () => {
    [[null], {}, 1, 1.0].forEach((invalidData) => {
      it(`Invalid ValidValue data :  ${JSON.stringify(invalidData)}`, () => {
        expect(() => { PropertyDefBuilder.fromJson(Object.assign({}, jsonData, {validValues: invalidData})).build().validate(); }).toThrowError();
      });
    });
  });

  it('should be valid if "validValues" is provided with data', () => {
    let validJsonData = Object.assign({}, jsonData, {validValues: ["a", "b", "c"]});
    const result = PropertyDefBuilder.fromJson( validJsonData).build().validValues as List<any>;
    expect(result.toArray()).toEqual(["a", "b", "c"]);
  });

  it('should be undefined if "validator" is not provided', () => {
    let validJsonData = Object.assign({}, jsonData);
    delete validJsonData['validator'];
    expect(PropertyDefBuilder.fromJson( validJsonData).build().validate().validator).toBeUndefined();
  });

  describe('should error if "validator" is provided with invalid data', () => {
    [null, {}, 1, 1.0, true, false].forEach((invalidData) => {
      it(`Invalid Validator data :  ${JSON.stringify(invalidData)}`, () => {
        expect(() => { PropertyDefBuilder.fromJson(Object.assign({}, jsonData, {validator: invalidData})).build().validate(); }).toThrowError();
      });
    });
  });

  it('should be valid if "repeated" is not provided', () => {
    let validJsonData = Object.assign({}, jsonData);
    delete validJsonData['repeated'];
    expect(PropertyDefBuilder.fromJson( validJsonData).build().validate().repeated).toBe(false);
  });

  it('should be valid if "repeated" is provided', () => {
    [true, false].forEach((repeated) => {
      let validJsonData = Object.assign({repeated: repeated}, jsonData);
      expect(PropertyDefBuilder.fromJson(validJsonData).build().validate().repeated).toBe(repeated);
    })
  });

  describe('should coerce "repeated" if not a boolean', () => {
    [null, {}, 1.0, 0, []].forEach((invalidData) => {
      it(`Invalid Repeated:  ${JSON.stringify(invalidData)}`, () => {
        expect(PropertyDefBuilder.fromJson(Object.assign({}, jsonData, {repeated: invalidData})).build().validate().repeated).toEqual(!!invalidData);
      });
    });
  });
});
