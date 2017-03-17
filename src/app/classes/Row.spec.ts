
import {Transformer} from "./Transformer";
import {Channel} from "./Channel";
import {Row} from "./Row";
describe('Row', () => {
  const inCh1 = new Channel("inputChannel1");
  const inCh2 = new Channel("inputChannel2");
  const inChans = [inCh1, inCh2];
  const outCh1 = new Channel("outChannel1");
  const outCh2 = new Channel("outChannel2");
  const outChans = [outCh1, outCh2];

  const transIn = new Transformer();
  transIn.inputChannels = inChans;
  const transOut = new Transformer();
  transOut.outputChannels = outChans;


  beforeEach(() => {
  });

  it('should test getInChannels', () => {
    const row = new Row();
    row.transformers = [transIn, transOut];
    expect(row.getInChannels()).toBe(transIn.inputChannels);
    row.transformers = [transIn, transOut, transOut];
    expect(row.getInChannels()).toBe(transIn.inputChannels);
  });

  it('should test getOutChannels', () => {
    const row = new Row();
    row.transformers = [transIn, transOut];
    expect(row.getOutChannels()).toBe(transOut.outputChannels);
    row.transformers = [transIn, transIn, transOut];
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

  it('should test getInChannels with empty tranformer', () => {
    const transformerWithoutInChannels = new Transformer();
    const row = new Row();
    row.transformers = [transformerWithoutInChannels];
    expect(row.getInChannels()).toEqual([]);
  });

  it('should test getOutChannels with empty tranformer', () => {
    const transformerWithoutOutChannels = new Transformer();
    const row = new Row();
    row.transformers = [transformerWithoutOutChannels];
    expect(row.getOutChannels()).toEqual([]);
  });
});
