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

  it('should serialize a single Analytic which has two inputs and a single output', () => {
    const result = rowSerializer.toApama((new RowBuilder()
      .MaxTransformerCount(3)
      .withInputChannel().Name("Input Channel 1").endWith()
      .withInputChannel().Name("Input Channel 2").endWith()
      .withOutputChannel().Name("Output Channel 1").endWith()
      .withTransformer()
        .Name("Analytic 1")
        .withInputChannel().Name("Analytic 1 : Input Channel 1").endWith()
        .withInputChannel().Name("Analytic 1 : Input Channel 2").endWith()
        .withOutputChannel().Name("Analytic 1 : Output Channel 1").endWith()
      .endWith()
      .build().toJson()), 0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);

    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual(['"Analytic 1",["Input Channel 1","Input Channel 2"],["Output Channel 1"],{}']);
  });

  it('should serialize a row with a single Analytic with one input and output channel', () => {
    const result = rowSerializer.toApama((new RowBuilder()
      .MaxTransformerCount(1)
      .withInputChannel().Name("Input Channel 1").endWith()
      .withOutputChannel().Name("Output Channel 1").endWith()
      .withTransformer()
        .Name("Analytic 1")
        .withInputChannel().Name("Analytic 1 : Input Channel 1").endWith()
        .withOutputChannel().Name("Analytic 1 : Output Channel 1").endWith()
      .endWith()
      .build().toJson()), 0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);
    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual(['"Analytic 1",["Input Channel 1"],["Output Channel 1"],{}']);
  });

  it('should serialize a row with two Analytics each with one input and output channel', () => {
    const result = rowSerializer.toApama((new RowBuilder()
      .MaxTransformerCount(1)
      .withInputChannel().Name("Input Channel 1").endWith()
      .withOutputChannel().Name("Output Channel 1").endWith()
      .withTransformer()
        .Name("Analytic 1")
        .withInputChannel().Name("Analytic 1 : Input Channel 1").endWith()
        .withOutputChannel().Name("Analytic 1 : Output Channel 1").endWith()
      .endWith()
      .withTransformer()
        .Name("Analytic 2")
        .withInputChannel().Name("Analytic 2 : Input Channel 1").endWith()
        .withOutputChannel().Name("Analytic 2 : Output Channel 1").endWith()
      .endWith()
      .build().toJson()), 0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);
    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual([
        '"Analytic 1",["Input Channel 1"],["Row0:Channel1"],{}',
        '"Analytic 2",["Row0:Channel1"],["Output Channel 1"],{}'
    ]);
  });

  it('should serialize a row with a single Analytic with two input channels and one output channel', () => {
    const result = rowSerializer.toApama((new RowBuilder()
      .MaxTransformerCount(1)
      .withInputChannel().Name("Input Channel 1").endWith()
      .withInputChannel().Name("Input Channel 2").endWith()
      .withOutputChannel().Name("Output Channel 1").endWith()
      .withTransformer()
        .Name("Analytic 1")
        .withInputChannel().Name("Analytic 1 : Input Channel 1").endWith()
        .withInputChannel().Name("Analytic 1 : Input Channel 2").endWith()
        .withOutputChannel().Name("Analytic 1 : Output Channel 1").endWith()
      .endWith()
      .build().toJson()), 0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);
    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual(['"Analytic 1",["Input Channel 1","Input Channel 2"],["Output Channel 1"],{}']);
  });

  it('should serialize a row with a single Analytic with one input channel and two output channels', () => {
    const result = rowSerializer.toApama((new RowBuilder()
      .MaxTransformerCount(1)
      .withInputChannel().Name("Input Channel 1").endWith()
      .withOutputChannel().Name("Output Channel 1").endWith()
      .withOutputChannel().Name("Output Channel 2").endWith()
      .withTransformer()
        .Name("Analytic 1")
        .withInputChannel().Name("Analytic 1 : Input Channel 1").endWith()
        .withOutputChannel().Name("Analytic 1 : Output Channel 1").endWith()
        .withOutputChannel().Name("Analytic 1 : Output Channel 2").endWith()
      .endWith()
      .build().toJson()), 0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);
    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual(['"Analytic 1",["Input Channel 1"],["Output Channel 1","Output Channel 2"],{}']);
  });

  it('should serialize a row with a single Analytic with two input channels and two output channels', () => {
    const result = rowSerializer.toApama((new RowBuilder()
      .MaxTransformerCount(1)
      .withInputChannel().Name("Input Channel 1").endWith()
      .withInputChannel().Name("Input Channel 2").endWith()
      .withOutputChannel().Name("Output Channel 1").endWith()
      .withOutputChannel().Name("Output Channel 2").endWith()
      .withTransformer()
        .Name("Analytic 1")
        .withInputChannel().Name("Analytic 1 : Input Channel 1").endWith()
        .withInputChannel().Name("Analytic 1 : Input Channel 2").endWith()
        .withOutputChannel().Name("Analytic 1 : Output Channel 1").endWith()
        .withOutputChannel().Name("Analytic 1 : Output Channel 2").endWith()
      .endWith()
      .build().toJson()), 0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);
    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual([    '"Analytic 1",["Input Channel 1","Input Channel 2"],["Output Channel 1","Output Channel 2"],{}']);
  });

  it('should serialize a row with a single Analytic with no input channels and one output channel', () => {
    const result = rowSerializer.toApama((new RowBuilder()
      .MaxTransformerCount(1)
      .withOutputChannel().Name("Output Channel 1").endWith()
      .withTransformer()
        .Name("Analytic 1")
        .withOutputChannel().Name("Analytic 1 : Output Channel 1").endWith()
      .endWith()
      .build().toJson()), 0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);
    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual(['"Analytic 1",[""],["Output Channel 1"],{}']);
  });

  it('should serialize a row with a single Analytic with one input channel and no output channels', () => {
    const result = rowSerializer.toApama((new RowBuilder()
      .MaxTransformerCount(1)
      .withInputChannel().Name("Input Channel 1").endWith()
      .withTransformer()
        .Name("Analytic 1")
        .withInputChannel().Name("Analytic 1 : Input Channel 1").endWith()
      .endWith()
      .build().toJson()), 0);

    console.info(result);
    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);
    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual(['"Analytic 1",["Input Channel 1"],[""],{}']);
  });

});
