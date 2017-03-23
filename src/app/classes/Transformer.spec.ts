import {Transformer} from "./Transformer";
import {Channel} from "./Channel";
import {Property} from "./Property";

describe('Transformer', () => {
  const validPropObj = Object.freeze({ name: "validName", type: "integer" as "integer", optional: false, value: 1 });
  const validPropObj2 = Object.freeze({ name: "validName2", type: "integer" as "integer", optional: false, value: 1 });
  const invalidPropObj = Object.freeze(Object.assign({}, validPropObj, { name: undefined }));
  const validTransformerObj = Object.freeze({name: "validName"});
  const validChannelObj = Object.freeze({ name: "validChannelName" });

  describe("Should throw an error if constructed with an invalid object", () => {
    [null, undefined, [], {}, ''].forEach((obj) => {
      it(`Construction Object: ${obj}`, () => {
        expect(() => { new Transformer(obj as any); }).toThrowError();
      })
    });
  });

  it('should be valid if instantiated correctly', () => {
    const transformer = new Transformer(validTransformerObj);
    expect(transformer.name).toEqual("validName");
  });

  describe('should be invalid if name is incorrect', () => {
    [null, undefined, '', {}].forEach((name) => {
      it(`Name: ${name}`,() => {
        expect(() => { new Transformer(Object.assign({}, validTransformerObj, {name: name})); }).toThrowError();
      });
    });
  });

  describe('should be valid if inputChannels is correct', () => {
    [[], [validChannelObj]].forEach((inChans) => {
      it(`InputChannels: ${inChans}`,() => {
        const transformer = new Transformer(Object.assign({}, validTransformerObj, {inputChannels: inChans}));
        expect(transformer.inputChannels.length).toEqual(inChans.length);
        expect(transformer.inputChannels.map(inCh => { return inCh.name })).toEqual(inChans.map(inCh => { return inCh.name }));
        for (let inCh of transformer.inputChannels) {
          expect(inCh).toEqual(jasmine.any(Channel));
        }
      });
    });
  });

  describe('should be invalid if inputChannels is incorrect', () => {
    [{}].forEach((inChans) => {
      it(`InputChannels: ${inChans}`,() => {
        expect(() => { new Transformer(Object.assign({}, validTransformerObj, {inputChannels: inChans})) }).toThrowError();
      });
    });
  });

  describe('should be valid if outputChannels is correct', () => {
    [[], [validChannelObj]].forEach((outChans) => {
      it(`InputChannels: ${outChans}`,() => {
        const transformer = new Transformer(Object.assign({}, validTransformerObj, {outputChannels: outChans}));
        expect(transformer.outputChannels.length).toEqual(outChans.length);
        expect(transformer.outputChannels.map(outCh => { return outCh.name })).toEqual(outChans.map(outCh => { return outCh.name }));
        for (let outCh of transformer.outputChannels) {
          expect(outCh).toEqual(jasmine.any(Channel));
        }
      });
    });
  });

  describe('should be invalid if outputChannels is incorrect', () => {
    [{}].forEach((outChans) => {
      it(`Output Channels: ${outChans}`,() => {
        expect(() => { new Transformer(Object.assign({}, validTransformerObj, {outputChannels: outChans})) }).toThrowError();
      });
    });
  });

  it('should be valid if all properties are valid', () => {
    const properties = Object.freeze([validPropObj, validPropObj2]);
    const transformer = new Transformer(Object.assign({}, validTransformerObj, {properties: properties}));
    expect(transformer.properties.map(prop => { return prop.name })).toEqual(properties.map(prop => { return prop.name }));
    for (let property of transformer.properties) {
      expect(property).toEqual(jasmine.any(Property));
    }
  });

  it('should be invalid if any properties are invalid', () => {
    expect(() => { new Transformer(Object.assign({}, validTransformerObj, {properties: [validPropObj, invalidPropObj, validPropObj2]})) }).toThrowError();
  });

  it('should not allow the same property (by name) multiple times', () => {
    expect(() => { new Transformer(Object.assign({}, validTransformerObj, {properties: [validPropObj, validPropObj]})) }).toThrowError();
  });
});
