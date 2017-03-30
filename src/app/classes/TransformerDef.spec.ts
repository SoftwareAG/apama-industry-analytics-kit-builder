import {TransformerDef} from "./TransformerDef";
import {PropertyDef} from "./PropertyDef";

describe('TransformerDefDef', () => {
  const validPropObj = Object.freeze({ name: "validName", description: "validDescription", type: "integer" as "integer", optional: false });
  const validPropObj2 = Object.freeze({ name: "validName2", description: "validDescription2", type: "integer" as "integer", optional: false });
  const invalidPropObj = Object.freeze(Object.assign({}, validPropObj, { name: undefined }));
  const validTransformerDefObj = Object.freeze({name: "validName"});

  describe("Should throw an error if constructed with an invalid object", () => {
    [null, undefined, [], {}, ''].forEach((obj) => {
      it(`Construction Object: ${obj}`, () => {
        expect(() => { new TransformerDef(obj as any); }).toThrowError();
      })
    });
  });

  it('should be valid if instantiated correctly', () => {
    const transformerDef = new TransformerDef(validTransformerDefObj);
    expect(transformerDef.name).toEqual("validName");
  });

  describe('should be invalid if name is incorrect', () => {
    [null, undefined, '', {}].forEach((name) => {
      it(`Name: ${name}`,() => {
        expect(() => { new TransformerDef(Object.assign({}, validTransformerDefObj, {name: name})); }).toThrowError();
      });
    });
  });

  it('should be valid if all properties are valid', () => {
    const properties = Object.freeze([validPropObj, validPropObj2]);
    const transformerDef = new TransformerDef(Object.assign({}, validTransformerDefObj, {properties: properties}));
    expect(transformerDef.properties.map(prop => { return prop.name })).toEqual(properties.map(prop => { return prop.name }));
    for (let property of transformerDef.properties) {
      expect(property).toEqual(jasmine.any(PropertyDef));
    }
  });

  it('should be invalid if any properties are invalid', () => {
    expect(() => { new TransformerDef(Object.assign({}, validTransformerDefObj, {properties: [validPropObj, invalidPropObj, validPropObj2]})) }).toThrowError();
  });

  it('should not allow the same property (by name) multiple times', () => {
    expect(() => { new TransformerDef(Object.assign({}, validTransformerDefObj, {properties: [validPropObj, validPropObj]})) }).toThrowError();
  });
});
