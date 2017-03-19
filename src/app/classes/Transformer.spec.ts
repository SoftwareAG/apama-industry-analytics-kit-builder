import {Property, Transformer} from "./Transformer";
import {validateSync, ValidationError} from "class-validator";
describe('Property', () => {
  const validProp = Object.freeze({ name: "validName", type: "integer", optional: false, value: 1 });

  it('should be valid when provided valid fields', () => {
    const property = new Property(validProp);
    expect(validateSync(property)).toEqual([]);
  });

  describe('should be invalid when provided incorrect name', () => {
    [null, undefined, {}, ''].forEach((name) => {
      it(`Name: ${name}`, () => {
        const property = new Property(Object.assign({}, validProp, { name: name }));
        expect(validateSync(property)).toContain(jasmine.any(ValidationError));
      });
    });
  });

  describe('should be invalid when provided incorrect type', () => {
    [null, undefined, "invalid", {}].forEach((type) => {
      it(`Type: ${type}`, () => {
        const property = new Property(Object.assign({}, validProp, { type: type }));
        expect(validateSync(property)).toContain(jasmine.any(ValidationError));
      });
    });
  });

  describe('should be valid when provided correct values for optional flag', () => {
    [
      [true, [undefined, 0]],
      [false, [0]],
      [undefined, [0]]
    ].forEach(([optional, values]: [boolean, any[]]) => {
      for (let value of values) {
        it(`Optional: ${optional}, Value: ${value}`, () => {
          let property = new Property(Object.assign({}, validProp, { optional: optional, value: value }));
          expect(validateSync(property)).toEqual([]);
        })
      }
    });
  });

  describe('should be invalid when provided incorrect values for optional flag', () => {
    [
      [false, [null, undefined]],
      [undefined, [null, undefined]],
      [null, [0]],
      [{}, [0]],
      ["true", [0]],
    ].forEach(([optional, values]: [boolean, any[]]) => {
      for (let value of values) {
        it(`Optional: ${optional}, Value: ${value}`, () => {
          let property = new Property(Object.assign({}, validProp, { optional: optional, value: value }));
          expect(validateSync(property)).toContain(jasmine.any(ValidationError));
        })
      }
    });
  });

  describe('should be valid when provided correct values for type', () => {
      [
        ['integer', [-1, 0, 1, 1.0]],
        ['string', ["", "hello"]],
        ['float', [-1.234, 0.0, 1.234]],
        ['decimal', [-1.234, 0.0, 1.234]],
        ['boolean', [true, false]],
      ].forEach(([validType, values]) => {
        for (let value of values) {
          it(`ApamaType: ${validType}, Value: ${value}`, () => {
            let property = new Property(Object.assign({}, validProp, { type: validType, value: value }));
            expect(validateSync(property)).toEqual([]);
          })
        }
      });
  });

  describe('should be invalid when provided incorrect values for type', () => {
    [
      ['integer', [0.1, 0.99999999999, true, false, "0", "1", undefined, null, {}]],
      ['string', [0, 1, true, false, undefined, null, {}]],
      ['float', [true, false, "0.0", "1.0", undefined, null, {}]],
      ['decimal', [true, false, "0.0", "1.0", undefined, null, {}]],
      ['boolean', [0, 1, "true", "false", "0", "1", undefined, null, {}]],
    ].forEach(([validType, values]) => {
      for (let value of values) {
        it(`ApamaType: ${validType}, Value: ${value}`, () => {
          let property = new Property(Object.assign({}, validProp, { type: validType, value: value }));
          expect(validateSync(property)).toContain(jasmine.any(ValidationError));
        })
      }
    });
  });
});

describe('Transformer', () => {
  const validPropObj = Object.freeze({ name: "validName", type: "integer", optional: false, value: 1 });
  const invalidPropObj = Object.freeze(Object.assign({}, validPropObj, { name: undefined }));
  const validProp1 = Object.freeze(new Property(validPropObj));
  const validProp2 = Object.freeze(new Property(validPropObj));
  const invalidProp = Object.freeze(new Property(invalidPropObj));

  it('should be valid if all properties are valid', () => {
    const transformer = new Transformer([validProp1, validProp2]);
    expect(validateSync(transformer)).toEqual([]);
  });

  it('should be invalid if any properties are invalid', () => {
    const transformer = new Transformer([validProp1, invalidProp, validProp2]);
    expect(validateSync(transformer)).toContain(jasmine.any(ValidationError));
  });
});
