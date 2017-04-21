import {TransformerSerializer} from "app/classes/Transformer";
import {PropertySerializer} from "./Property";
import {TestBed} from "@angular/core/testing";
import {RowBuilder} from "./Row";
import {TestUtils} from "../services/TestUtil.spec";

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

  it("should throw an error if the transformer doesn't have a name", () => {
    const row = new RowBuilder()
      .withTransformer().endWith()
      .build()
      .toJson();

      expect(() => transformerSerializer.toApama(row.transformers[0], 0, row, 0)).toThrowError(/Transformer must have a name/);
  });

  describe("Should process Transformers with 0 or more input and output channels", () => {
    for(let channelCount = 0; channelCount <= 5; channelCount++) {
      let inputChannels : string[] = [];
      let outputChannels : string[] = [];

      let calcAnalytic = `"Analytic ${channelCount}",`;
      const rowBuilder = new RowBuilder().withTransformer()
        .Name(`Analytic ${channelCount}`);

      for( let channel = 1; channel <= channelCount; channel++) {
        rowBuilder.withInputChannel()
                            .Name(`Channel ${channel}`)
                          .endWith();
        rowBuilder.withOutputChannel()
                            .Name(`Channel ${channel}`)
                          .endWith();
        inputChannels.push(`"Row0:Input${channel-1}"`);
        outputChannels.push(`"Row0:Output${channel-1}"`);
      }

      calcAnalytic += '[';
      if (inputChannels.length === 0) {
        calcAnalytic += '""';
      } else {
        calcAnalytic += inputChannels.map( (inChannel) => {
          return inChannel;
        });
      }
      calcAnalytic += '],';

      calcAnalytic += '[';
      if (outputChannels.length === 0) {
        calcAnalytic += '""';
      } else {
        calcAnalytic += outputChannels.map( (outChannel) => {
          return outChannel;
        });
      }
      calcAnalytic += '],{}';

      const row = rowBuilder.endWith().build();

      it(` - Channel Count : ${channelCount}`, () => {
        const serialisedData = transformerSerializer.toApama(row.transformers.getValue().toArray()[0].toJson(), 0, row.toJson(), 0);
        const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, serialisedData).map(match => match[1]);
        expect(analytics).toEqual([
          calcAnalytic
        ]);
      })
    }
  });

});

