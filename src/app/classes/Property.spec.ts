
import {Property} from "./Property";
describe('Property', () => {
  const propertyObj = Object.freeze({name: "validName", description: "validDescription", type: "integer" as "integer", optional: false, value: 0});

  describe("Should throw an error if constructed with an invalid object", () => {
    [null, [], {}, ''].forEach((obj) => {
      it(`Construction Object: ${obj}`, () => {
        expect(() => { Property.fromObject(obj as any); }).toThrowError();
      })
    });
  });

  it('should be valid when provided valid fields', () => {
    const property = Property.fromObject(propertyObj);
    expect(property).toEqual(jasmine.any(Property));
    expect(property.name).toEqual("validName");
    expect(property.description).toEqual("validDescription");
    expect(property.type).toEqual("integer");
    expect(property.optional).toEqual(false);
    expect(property.value).toEqual(0);
  });

  describe('should be invalid when provided incorrect name', () => {
    [null, undefined, {}, ''].forEach((name) => {
      it(`Name: ${name}`, () => {
        expect(() => { Property.fromObject(Object.assign({}, propertyObj, {name: name})); }).toThrowError();
      });
    });
  });

  describe('should be invalid when provided incorrect description', () => {
    [null, undefined, {}, ''].forEach((description) => {
      it(`Description: ${description}`, () => {
        expect(() => { Property.fromObject(Object.assign({}, propertyObj, {description: description})); }).toThrowError();
      });
    });
  });

  describe('should be invalid when provided incorrect type', () => {
    [null, undefined, "invalid", {}].forEach((type) => {
      it(`Type: ${type}`, () => {
        expect(() => { Property.fromObject(Object.assign({}, propertyObj, {type: type})); }).toThrowError();
      });
    });
  });

  describe('should be valid when provided correct values for optional flag', () => {
    [['integer', 0], ['string', "hello"], ['float', 0.1], ['decimal', 0.1], ['boolean', true]].forEach(([type, validValue]) => {
      [
        [true, [undefined, validValue]],
        [false, [validValue]],
        [undefined, [validValue]]
      ].forEach(([optional, values]: [boolean, any[]]) => {
        for (let value of values) {
          it(`ApamaType: ${type}, Optional: ${optional}, Value: ${value}`, () => {
            const property = Property.fromObject(Object.assign({}, propertyObj, {type: type, optional: optional, value: value}));
            expect(property).toEqual(jasmine.any(Property));
            expect(property.name).toEqual("validName");
            expect(property.description).toEqual("validDescription");
            expect(property.type).toEqual(type);
            expect(property.optional).toEqual(!!optional);
            expect(property.value).toEqual(value);
          })
        }
      });
    });
  });

  describe('should be invalid when provided incorrect values for optional flag', () => {
    [['integer', 0], ['string', "hello"], ['float', 0.1], ['decimal', 0.1], ['boolean', true]].forEach(([type, validValue]) => {
      [
        [false, [null, undefined]],
        [undefined, [null, undefined]],
        [null, [validValue]],
        [{}, [validValue]],
        ["true", [validValue]],
      ].forEach(([optional, values]: [boolean, any[]]) => {
        for (let value of values) {
          it(`ApamaType: ${type}, Optional: ${optional}, Value: ${value}`, () => {
            expect(() => {
              Property.fromObject(Object.assign({}, propertyObj, {type: type, optional: optional, value: value}));
            }).toThrowError();
          })
        }
      });
    });
  });

  describe('should be valid when provided correct values for type', () => {
    [true, false].forEach((optional) => {
      [
        ['integer', [-1, 0, 1, 1.0]],
        ['string', ["", "hello"]],
        ['float', [-1.234, 0.0, 1.234]],
        ['decimal', [-1.234, 0.0, 1.234]],
        ['boolean', [true, false]],
      ].forEach(([validType, values]) => {
        for (let value of values) {
          it(`Optional: ${optional}, ApamaType: ${validType}, Value: ${value}`, () => {
            const property = Property.fromObject(Object.assign({}, propertyObj, {optional: optional, type: validType, value: value}));
            expect(property).toEqual(jasmine.any(Property));
            expect(property.name).toEqual("validName");
            expect(property.description).toEqual("validDescription");
            expect(property.type).toEqual(validType);
            expect(property.optional).toEqual(optional);
            expect(property.value).toEqual(value);
          })
        }
      });
    });
  });

  describe('should be invalid when provided incorrect values for type', () => {
    [true, false].forEach((optional) => {
      [
        ['integer', [0.1, 0.99999999999, true, false, "0", "1", null, {}]],
        ['string', [0, 1, true, false, null, {}]],
        ['float', [true, false, "0.0", "1.0", null, {}]],
        ['decimal', [true, false, "0.0", "1.0", null, {}]],
        ['boolean', [0, 1, "true", "false", "0", "1", null, {}]],
      ].forEach(([validType, values]) => {
        for (let value of values) {
          it(`Optional: ${optional}, ApamaType: ${validType}, Value: ${value}`, () => {
            expect(() => {
              Property.fromObject(Object.assign({}, propertyObj, {optional: optional, type: validType, value: value}));
            }).toThrowError();
          })
        }
      });
    });
  });
});
