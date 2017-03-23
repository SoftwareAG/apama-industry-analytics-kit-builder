
import {PropertyDef} from "./PropertyDef";
describe('PropertyDef', () => {
  const propertyDefObj = Object.freeze({name: "validName", type: "integer" as "integer", optional: false});

  describe("Should throw an error if constructed with an invalid object", () => {
    [null, [], {}, ''].forEach((obj) => {
      it(`Construction Object: ${obj}`, () => {
        expect(() => { new PropertyDef(obj as any); }).toThrowError();
      })
    });
  });

  it('should be valid when provided valid fields', () => {
    const propertyDef = new PropertyDef(propertyDefObj);
    expect(propertyDef).toEqual(jasmine.any(PropertyDef));
    expect(propertyDef.name).toEqual("validName");
    expect(propertyDef.type).toEqual("integer");
    expect(propertyDef.optional).toEqual(false);
  });

  describe('should be invalid when provided incorrect name', () => {
    [null, undefined, {}, ''].forEach((name) => {
      it(`Name: ${name}`, () => {
        expect(() => { new PropertyDef(Object.assign({}, propertyDefObj, {name: name})); }).toThrowError();
      });
    });
  });

  describe('should be invalid when provided incorrect type', () => {
    [null, undefined, "invalid", {}].forEach((type) => {
      it(`Type: ${type}`, () => {
        expect(() => { new PropertyDef(Object.assign({}, propertyDefObj, {type: type})); }).toThrowError();
      });
    });
  });

  describe('should be invalid when provided incorrect optional', () => {
    [null, [], "invalid", {}].forEach((optional) => {
      it(`Optional: ${optional}`, () => {
        expect(() => { new PropertyDef(Object.assign({}, propertyDefObj, {optional: optional})); }).toThrowError();
      });
    });
  });
});
