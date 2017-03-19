
import {Transformer} from "./Transformer";
import {Channel} from "./Channel";
import {Row} from "./Row";
import {validateSync, ValidationError} from "class-validator";
describe('Row', () => {
  const inCh1 = Object.freeze(new Channel("inputChannel1"));
  const inCh2 = Object.freeze(new Channel("inputChannel2"));
  const inChans : ReadonlyArray<Channel> = Object.freeze([inCh1, inCh2]);
  const outCh1 = Object.freeze(new Channel("outChannel1"));
  const outCh2 = Object.freeze(new Channel("outChannel2"));
  const outChans : ReadonlyArray<Channel> = Object.freeze([outCh1, outCh2]);

  const transIn = new Transformer();
  transIn.inputChannels = inChans as Channel[];
  const transOut = new Transformer();
  transOut.outputChannels = outChans as Channel[];
  Object.freeze(transIn);
  Object.freeze(transOut);

  it('should add transformers and still be valid', () => {
    const row = new Row(5);

    for (let i = 1; i <= 5; i ++) {
      row.transformers.push(transIn);
      expect(validateSync(row)).toEqual([]);
      expect(row.transformers).toEqual((new Array(i)).fill(transIn));
    }
  });

  it('should remove transformers and still be valid', () => {
    const row = new Row(5);
    row.transformers.push(transIn, transIn, transIn, transIn, transIn);

    for (let i = 5; i > 0; i --) {
      row.transformers.pop();
      expect(validateSync(row)).toEqual([]);
      expect(row.transformers).toEqual((new Array(i-1)).fill(transIn));
    }
  });

  it('should be invalid if there are too many transforms', () => {
    for (let i = 1; i <= 2; i++) {
      const row = new Row(i-1);

      row.transformers.push(...(new Array(i)).fill(transIn));
      expect(validateSync(row)).toContain(jasmine.any(ValidationError));
    }
  });

  it('should test getInChannels with a single transformer', () => {
    const row = new Row();

    row.transformers.push(transIn);
    expect(row.getInChannels()).toBe(transIn.inputChannels);
  });

  it('should test getInChannels with multiple transformers', () => {
    const row = new Row();

    row.transformers.push(transIn);
    row.transformers.push(transOut);
    row.transformers.push(transOut);
    expect(row.getInChannels()).toBe(transIn.inputChannels);
  });

  it('should test getOutChannels with a single transformer', () => {
    const row = new Row();
    row.transformers.push(transOut);
    expect(row.getOutChannels()).toBe(transOut.outputChannels);
  });

  it('should test getOutChannels with multiple transformers', () => {
    const row = new Row();

    row.transformers.push(transIn);
    row.transformers.push(transIn);
    row.transformers.push(transOut);
    expect(row.getOutChannels()).toBe(transOut.outputChannels);
  });

  it('should test getInChannels without tranformers', () => {
    const row = new Row();
    expect(row.getInChannels()).toEqual([]);
  });

  it('should test getOutChannels without tranformers', () => {
    const row = new Row();
    expect(row.getOutChannels()).toEqual([]);
  });

  it('should test getInChannels with empty transformer', () => {
    const transformerWithoutInChannels = new Transformer();
    const row = new Row();
    row.transformers.push(transformerWithoutInChannels);
    expect(row.getInChannels()).toEqual([]);
  });

  it('should test getOutChannels with empty transformer', () => {
    const transformerWithoutOutChannels = new Transformer();
    const row = new Row();
    row.transformers.push(transformerWithoutOutChannels);
    expect(row.getOutChannels()).toEqual([]);
  });

});
