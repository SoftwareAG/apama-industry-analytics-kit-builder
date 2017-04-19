import {TransformerSerializer} from "app/classes/Transformer";
import {PropertySerializer} from "./Property";
import {TestBed} from "@angular/core/testing";
import {RowBuilder} from "./Row";

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

  it('should handle an empty Transformer', () => {
    const row = new RowBuilder()
      .withTransformer()
      .endWith()
      .build();

    const result = transformerSerializer.toApama(row.transformers.getValue().toArray()[0].toJson(), 0, row.toJson(), 0);
    expect(result).toBe('')
  });

});

