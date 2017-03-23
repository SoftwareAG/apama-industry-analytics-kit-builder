
import {Transformer, TransformerInterface} from "./Transformer";
import {Row} from "./Row";
import deepFreeze = require("deep-freeze");
describe('Row', () => {
  const transformerObj = Object.freeze({name: "validName"}) as TransformerInterface;
  const transIn = deepFreeze(new Transformer({ name: "validName", inputChannels: [{name: "inputChannel1"}, {name: "inputChannel2"}] }));
  const transOut = deepFreeze(new Transformer({ name: "validName", inputChannels: [{name: "outputChannel1"}, {name: "outputChannel2"}] }));

  describe("Should throw an error if constructed with an invalid object", () => {
    [null, [], {}, ''].forEach((obj) => {
      it(`Construction Object: ${obj}`, () => {
        expect(() => { new Row(obj as any); }).toThrowError();
      })
    });
  });

  it('should allow multiple transformers during construction', () => {
    for (let i = 1; i <= 5; i ++) {
      const row = new Row({ maxTransformerCount: 5, transformers: (new Array(i)).fill(transformerObj) })
      expect(row.transformers).toBeArrayOfSize(i);
      for (let transformer of row.transformers) {
        expect(transformer.name).toEqual("validName");
      }
    }
  });

  it('should throw an error if there are too many transforms', () => {
    for (let i = 1; i <= 2; i++) {
     expect(() => { new Row({ maxTransformerCount: i-1, transformers: (new Array(i)).fill(transformerObj) }); }).toThrowError();
    }
  });

  it('should correctly getInChannels with a single transformer', () => {
    const row = new Row();

    row.transformers.push(transIn);
    expect(row.getInChannels()).toBe(transIn.inputChannels);
  });

  it('should correctly getInChannels with multiple transformers', () => {
    const row = new Row();

    row.transformers.push(transIn);
    row.transformers.push(transOut);
    row.transformers.push(transOut);
    expect(row.getInChannels()).toBe(transIn.inputChannels);
  });

  it('should correctly getOutChannels with a single transformer', () => {
    const row = new Row();
    row.transformers.push(transOut);
    expect(row.getOutChannels()).toBe(transOut.outputChannels);
  });

  it('should correctly getOutChannels with multiple transformers', () => {
    const row = new Row();

    row.transformers.push(transIn);
    row.transformers.push(transIn);
    row.transformers.push(transOut);
    expect(row.getOutChannels()).toBe(transOut.outputChannels);
  });

  it('should correctly getInChannels without tranformers', () => {
    const row = new Row();
    expect(row.getInChannels()).toEqual([]);
  });

  it('should correctly getOutChannels without tranformers', () => {
    const row = new Row();
    expect(row.getOutChannels()).toEqual([]);
  });

  it('should correctly getInChannels with empty transformer', () => {
    const transformerWithoutInChannels = new Transformer(transformerObj);
    const row = new Row();
    row.transformers.push(transformerWithoutInChannels);
    expect(row.getInChannels()).toEqual([]);
  });

  it('should correctly getOutChannels with empty transformer', () => {
    const transformerWithoutOutChannels = new Transformer(transformerObj);
    const row = new Row();
    row.transformers.push(transformerWithoutOutChannels);
    expect(row.getOutChannels()).toEqual([]);
  });

});
