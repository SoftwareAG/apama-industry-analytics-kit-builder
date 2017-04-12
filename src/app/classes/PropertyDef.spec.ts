import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {PropertyDef, PropertyDefBuilder} from "./PropertyDef";
describe('PropertyDef', () => {

  const jsonData = {
    name: 'validName',
    description: 'validDescription',
    type: "string" as "string",
    optional: true
  };

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new PropertyDefBuilder().build(), done).then(done);
  });

  it('should convert valid JSON PropertyDef data into a PropertyDef', () => {
    const propertyDef = PropertyDefBuilder.fromJson(jsonData).build();
    expect(propertyDef.name.getValue()).toEqual(jsonData.name);
    expect(propertyDef.description.getValue()).toEqual(jsonData.description);
    expect(propertyDef.type.getValue()).toEqual(jsonData.type);
    expect(propertyDef.optional.getValue()).toEqual(jsonData.optional);
  });

  describe("Should throw an error if passed invalid JSON 'name' Data", () => {
    [null, [], {}, ''].forEach((item) => {
      it(`Construction Object: ${item}`, () => {
        expect(() => { PropertyDefBuilder.fromJson( Object.assign({}, jsonData, {name: item})); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if passed invalid JSON 'description' data", () => {
    [null, [], {}, ''].forEach((item) => {
      it(`Invalid "description" data: ${item}`, () => {
        expect(() => { PropertyDefBuilder.fromJson( Object.assign({}, jsonData, {description: item})); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if passed invalid JSON 'type' data", () => {
    [null, [], {}, ''].forEach((item) => {
      it(`Invalid "type" data: ${item}`, () => {
        expect(() => { PropertyDefBuilder.fromJson( Object.assign({}, jsonData, {type: item})); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if passed invalid JSON 'optional' Data", () => {
    [null, [], {}, ''].forEach((item) => {
      it(`Invalid "optional" data: ${item}`, () => {
        expect(() => { PropertyDefBuilder.fromJson( Object.assign({}, jsonData, {type: item})); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if name | description | type is missing from the JSON data", () => {
    ['name', 'description', 'type'].forEach((element) => {
      it(`Missing element: ${element}`, () => {
        let invalidData = Object.assign({}, jsonData);
        delete invalidData[element];
        expect(() => { PropertyDefBuilder.fromJson( invalidData); }).toThrowError();
      })
    });
  });

  it('should be valid if "optional" element is not provided', () => {
    let validJsonData = Object.assign({}, jsonData);
    delete validJsonData['optional'];
    expect(() => { PropertyDefBuilder.fromJson( validJsonData).build(); }).toBeDefined();
  });

  describe('should be valid if "optional" element is provided with boolean values', () => {
    [true, false].forEach((validOptionalValue) => {
      it(`valid Optional Value: ${validOptionalValue}`, () => {
        expect(() => {
          PropertyDefBuilder.fromJson(Object.assign({}, jsonData, {optional: validOptionalValue})).build();
        }).toBeDefined();
      })
    });
  });

  describe("should throw an error if optional is provided and type is not boolean", () => {
    [null, {}, '', 1, -1, 0].forEach((optionalValue) => {
      it(`invalid optional value: ${optionalValue}`, () => {
        expect(() => { PropertyDefBuilder.fromJson(Object.assign({}, jsonData, {optional: optionalValue})); }).toThrowError();
      })
    });
  });

  describe("Should ignore any other elements in the JSON data", () => {
    const validPropertyDef = PropertyDefBuilder.fromJson(Object.assign({}, jsonData)).build();
    [{ a: 'a'}, {b: 2}, {c: true}, {d: {} }].forEach((object) => {
        it(`Ignore :  ${JSON.stringify(object)}`, () => {
          const propertyDef = PropertyDefBuilder.fromJson(Object.assign({}, jsonData, object)).build();
          expect(propertyDef).toEqual(validPropertyDef);
        });
    });
  });
});
