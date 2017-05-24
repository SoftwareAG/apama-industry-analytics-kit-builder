import {TransformerBuilder, TransformerSerializer} from "app/classes/Transformer";
import {RowBuilder, RowSerializer} from "./Row";
import {PropertySerializer} from "./Property";
import {TestBed} from "@angular/core/testing";
import {TestUtils} from "../services/TestUtil.spec";
import {Metadata, MetadataBuilder} from "./Metadata";

describe('RowSerializer', () => {

  let rowSerializer: RowSerializer;

  const testMetadata: Metadata = new MetadataBuilder()
  .Version("0.0")
  .withAnalytic()
    .Name("Analytic1")
    .withInputChannel().Name("Analytic1:Input1").endWith()
    .withOutputChannel().Name("Analytic1:Output1").endWith()
    .endWith()
  .withAnalytic()
    .Name("Analytic2")
    .withInputChannel().Name("Analytic2:Input1").endWith()
    .withOutputChannel().Name("Analytic2:Output1").endWith()
    .endWith()
  .withAnalytic()
    .Name("Analytic3")
    .withInputChannel().Name("Analytic3:Input1").endWith()
    .withInputChannel().Name("Analytic3:Input2").endWith()
    .withInputChannel().Name("Analytic3:Input3").endWith()
    .withInputChannel().Name("Analytic3:Input4").endWith()
    .withOutputChannel().Name("Analytic3:Output1").endWith()
    .withOutputChannel().Name("Analytic3:Output2").endWith()
    .withOutputChannel().Name("Analytic3:Output3").endWith()
    .withOutputChannel().Name("Analytic3:Output4").endWith()
    .endWith()
  .build();

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

  it('should serialize a row with no analytics', () => {
    const result = rowSerializer.toApama(
      testMetadata,
      new RowBuilder()
        .MaxTransformerCount(3)
        .build(),
      0);

    expect(result).toBe('');
  });

  it('should serialize a row with 1 analytic', () => {
    const result = rowSerializer.toApama(
      testMetadata,
      new RowBuilder()
        .MaxTransformerCount(3)
        .pushTransformer(testMetadata.createAnalytic("Analytic1"))
        .build(),
      0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);

    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual(['"Analytic1",["Row0:Input0"],["Row0:Output0"],{}']);
  });

  it('should serialize a row with 2 analytics', () => {
    const result = rowSerializer.toApama(
      testMetadata,
      new RowBuilder()
        .MaxTransformerCount(3)
        .pushTransformer(testMetadata.createAnalytic("Analytic1"))
        .pushTransformer(testMetadata.createAnalytic("Analytic2"))
        .build(),
      0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);

    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual([
      '"Analytic1",["Row0:Input0"],["Row0:Channel1.0"],{}',
      '"Analytic2",["Row0:Channel1.0"],["Row0:Output0"],{}',
    ]);
  });

  it('should serialize a row with 1 analytic and overridden input and output channels', () => {
    const result = rowSerializer.toApama(
      testMetadata,
      new RowBuilder()
        .MaxTransformerCount(3)
        .withInputChannel(0).Name("OverriddenInput").endWith()
        .withOutputChannel(0).Name("OverriddenOutput").endWith()
        .pushTransformer(testMetadata.createAnalytic("Analytic1"))
        .build(),
      0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);

    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual(['"Analytic1",["OverriddenInput"],["OverriddenOutput"],{}']);
  });

  it('should serialize a row with 2 analytics and overridden input and output channels', () => {
    const result = rowSerializer.toApama(
      testMetadata,
      new RowBuilder()
        .MaxTransformerCount(3)
        .withInputChannel(0).Name("OverriddenInput").endWith()
        .withOutputChannel(0).Name("OverriddenOutput").endWith()
        .pushTransformer(testMetadata.createAnalytic("Analytic1"))
        .pushTransformer(testMetadata.createAnalytic("Analytic2"))
        .build(),
      0);

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);

    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual([
      '"Analytic1",["OverriddenInput"],["Row0:Channel1.0"],{}',
      '"Analytic2",["Row0:Channel1.0"],["OverriddenOutput"],{}',
    ]);
  });

  describe('should correctly override any input or output channel', () => {
    for(let i = 0; i < 4; i++) {
      it(`OverriddenChannelNumber: ${i}`, () => {
        const result = rowSerializer.toApama(
          testMetadata,
          new RowBuilder()
            .MaxTransformerCount(3)
            .withInputChannel(i).Name("OverriddenInput").endWith()
            .withOutputChannel(i).Name("OverriddenOutput").endWith()
            .pushTransformer(testMetadata.createAnalytic("Analytic3"))
            .build(),
          0);

        const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
        expect(rows).toEqual(["0"]);

        const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
        const expectedInputChannels = [
          "Row0:Input0",
          "Row0:Input1",
          "Row0:Input2",
          "Row0:Input3"
        ];
        expectedInputChannels[i] = "OverriddenInput";
        const expectedOutputChannels = [
          "Row0:Output0",
          "Row0:Output1",
          "Row0:Output2",
          "Row0:Output3"
        ];
        expectedOutputChannels[i] = "OverriddenOutput";
        expect(analytics).toEqual([`"Analytic3",["${expectedInputChannels.join('","')}"],["${expectedOutputChannels.join('","')}"],{}`]);
      })
    }
  });
});
