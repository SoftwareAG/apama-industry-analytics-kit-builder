import {TransformerBuilder, TransformerSerializer} from "app/classes/Transformer";
import {PropertySerializer} from "./Property";
import {TestBed} from "@angular/core/testing";
import {RowBuilder} from "./Row";
import {TestUtils} from "../services/TestUtil.spec";
import {TransformerDefBuilder} from "./TransformerDef";

describe('TransformerSerializer', () => {

  let transformerSerializer: TransformerSerializer;

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

        const result = transformerSerializer.toApama(row.transformers.getValue().toArray()[0], transformerDef, 0, row, 0);
        const inputChannels = TestUtils.findAll(/[\.\w]*Analytic\(.*?\[(.*?)\]/g, result).map(match => match[0])[0].split(",");
        const outputChannels = TestUtils.findAll(/[\.\w]*Analytic\(.*?\[.*?\[(.*?)\]/g, result).map(match => match[0])[0].split(",");
        if (i === 0) {
          expect(inputChannels).toEqual(['']);
          expect(outputChannels).toEqual(['']);
        } else {
          expect(inputChannels).toEqual(new Array(i).fill(undefined).map((value, z) => `"Row0:Input${z}"`));
          expect(outputChannels).toEqual(new Array(i).fill(undefined).map((value, z) => `"Row0:Output${z}"`));
        }
      })
    }
  });

});

