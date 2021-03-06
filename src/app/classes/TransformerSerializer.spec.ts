import {TransformerBuilder, TransformerSerializer} from "app/classes/Transformer";
import {PropertySerializer} from "./Property";
import {TestBed} from "@angular/core/testing";
import {RowBuilder} from "./Row";
import {TransformerDefBuilder} from "./TransformerDef";
import {Utils} from "../Utils";
import {Config, ConfigBuilder} from "./Config";

describe('TransformerSerializer', () => {

  let transformerSerializer: TransformerSerializer;

  const config: Config = new ConfigBuilder().Name("test").build();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TransformerSerializer,
        PropertySerializer
      ]
    });
    transformerSerializer = TestBed.get(TransformerSerializer) as TransformerSerializer;
  });

  describe("Should process Transformers with 0 or more input and output channels", () => {
    for(let i = 0; i <= 5; i++) {
      it(`TransformerChannels: ${i}`, () => {
        const transformerDefBuilder = new TransformerDefBuilder()
          .Name("Analytic1");

        for (let j = 1; j <= i; j++) {
          transformerDefBuilder.withInputChannel().Name(`InChannel${j}`).endWith();
          transformerDefBuilder.withOutputChannel().Name(`OutChannel${j}`).endWith();
        }

        const transformerDef = transformerDefBuilder.build();

        const row = new RowBuilder()
          .pushTransformer(TransformerBuilder.fromTransformerDef(transformerDef).build())
          .build();

        const result = transformerSerializer.toApama(config, row.transformers.getValue().toArray()[0], transformerDef, 0, row, 0);
        const inputChannels = Utils.findAll(/[\.\w]*Analytic\(.*?\[(.*?)\]/g, result).map(match => match[0])[0].split(",");
        const outputChannels = Utils.findAll(/[\.\w]*Analytic\(.*?\[.*?\[(.*?)\]/g, result).map(match => match[0])[0].split(",");
        if (i === 0) {
          expect(inputChannels).toEqual(['']);
          expect(outputChannels).toEqual(['']);
        } else {
          expect(inputChannels).toEqual(new Array(i).fill(undefined).map((value, z) => `"InChannel${z+1}"`));
          expect(outputChannels).toEqual(new Array(i).fill(undefined).map((value, z) => `"OutChannel${z+1}"`));
        }
      })
    }
  });

  describe("should process prefixed channels", () => {
    const transformerDef = new TransformerDefBuilder()
      .Name("TestAnalytic")
      .withInputChannel().Name("InChan1").Prefix("TestInputPrefix1:").endWith()
      .withInputChannel().Name("InChan2").Prefix("TestInputPrefix2:").endWith()
      .withInputChannel().Name("InChan3").endWith()
      .withOutputChannel().Name("OutChan1").Prefix("TestOutputPrefix1:").endWith()
      .withOutputChannel().Name("OutChan2").Prefix("TestOutputPrefix2:").endWith()
      .withOutputChannel().Name("OutChan3").endWith()
      .build();
    const row = new RowBuilder()
      .withInputChannel(0).Name("OverriddenInput").endWith()
      .withOutputChannel(0).Name("OverriddenOutput").endWith()
      .pushTransformer(TransformerBuilder.fromTransformerDef(transformerDef).build())
      .pushTransformer(TransformerBuilder.fromTransformerDef(transformerDef).build())
      .build();

    const inputChannelPattern = /\["([^"]*)","([^"]*)","([^"]*)"\]/;
    const outputChannelPattern = /\],\["([^"]*)","([^"]*)","([^"]*)"\]/;

    it("intermediate input channels", () =>{
      const result = transformerSerializer.toApama(config, row.transformers.getValue().last(), transformerDef, 1, row, 0);
      const [, inChan1, inChan2, inChan3] = result.match(inputChannelPattern) as RegExpMatchArray;
      expect(inChan1).toEqual(`${config.name.getValue()}:TestInputPrefix1:Row0:Channel1.0`);
      expect(inChan2).toEqual(`${config.name.getValue()}:TestInputPrefix2:Row0:Channel1.1`);
      expect(inChan3).toEqual(`${config.name.getValue()}:Row0:Channel1.2`);
    });

    it("intermediate output channels", () =>{
      const result = transformerSerializer.toApama(config, row.transformers.getValue().first(), transformerDef, 0, row, 0);
      const [, outChan1, outChan2, outChan3] = result.match(outputChannelPattern) as RegExpMatchArray;
      expect(outChan1).toEqual(`${config.name.getValue()}:TestOutputPrefix1:Row0:Channel1.0`);
      expect(outChan2).toEqual(`${config.name.getValue()}:TestOutputPrefix2:Row0:Channel1.1`);
      expect(outChan3).toEqual(`${config.name.getValue()}:Row0:Channel1.2`);
    });

    it("row input channels", () => {
      const result = transformerSerializer.toApama(config, row.transformers.getValue().first(), transformerDef, 0, row, 0);
      const [, inChan1, inChan2, inChan3] = result.match(inputChannelPattern) as RegExpMatchArray;
      expect(inChan1).toEqual("TestInputPrefix1:OverriddenInput");
      expect(inChan2).toEqual("TestInputPrefix2:InChan2");
      expect(inChan3).toEqual("InChan3");
    });

    it("row output channels", () => {
      const result = transformerSerializer.toApama(config, row.transformers.getValue().last(), transformerDef, 1, row, 0);
      const [, outChan1, outChan2, outChan3] = result.match(outputChannelPattern) as RegExpMatchArray;
      expect(outChan1).toEqual("TestOutputPrefix1:OverriddenOutput");
      expect(outChan2).toEqual("TestOutputPrefix2:OutChan2");
      expect(outChan3).toEqual("OutChan3");
    });
  })

});

