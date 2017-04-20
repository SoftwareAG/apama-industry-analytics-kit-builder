import {TransformerSerializer} from "app/classes/Transformer";
import {RowBuilder, RowSerializer} from "./Row";
import {PropertySerializer} from "./Property";
import {TestBed} from "@angular/core/testing";
import {TestUtils} from "../services/TestUtil.spec";

describe('RowSerializer', () => {

  let rowSerializer: RowSerializer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RowSerializer,
        TransformerSerializer,
        PropertySerializer
      ]
    });
    rowSerializer = TestBed.get(RowSerializer) as RowSerializer;
  });

  it('should handle an empty Row', () => {
    const result = rowSerializer.toApama((new RowBuilder().build().toJson()), 0);
    expect(result).toBe('')
  });

  it('should handle a single Analytic which has two inputs and a single output', () => {
    const result = rowSerializer.toApama((new RowBuilder()
      .MaxTransformerCount(3)
      .withOutputChannel().Name("Output Channel 1").endWith()
      .withTransformer()
        .Name("Analytic 1")
        .withInputChannel().Name("Input Channel 1").endWith()
        .withInputChannel().Name("Input Channel 2").endWith()
        .withOutputChannel().Name("Output Channel 1").endWith()
      .endWith()
      .build().toJson()), 0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);

    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual([
        '"Analytic 1",["Row0:Input0","Row0:Input1"],["Output Channel 1"],{}'
    ]);
  });
});
