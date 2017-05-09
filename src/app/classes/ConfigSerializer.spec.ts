import {ConfigBuilder, ConfigSerializer} from "./Config";
import {TransformerSerializer} from "app/classes/Transformer";
import {RowSerializer} from "./Row";
import {PropertySerializer} from "./Property";
import {TestBed} from "@angular/core/testing";
import {TestUtils} from "../services/TestUtil.spec";
import {Metadata, MetadataBuilder} from "./Metadata";
import * as _ from "lodash";

describe('ConfigSerializer', () => {

  let configSerializer: ConfigSerializer;
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
      .withOutputChannel().Name("Analytic3:Output1").endWith()
      .withOutputChannel().Name("Analytic3:Output2").endWith()
      .endWith()
    .build();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConfigSerializer,
        RowSerializer,
        TransformerSerializer,
        PropertySerializer
      ]
     });
    configSerializer = TestBed.get(ConfigSerializer) as ConfigSerializer;
  });

  it('should handle an empty Config', () => {
    const result = configSerializer.toApama(testMetadata, new ConfigBuilder().build());
    expect(result).toBe('\\\\ Version: 0.0.0.0\n')
  });

  it('should correctly serialize name, description, and version', () => {
      const result: string = configSerializer.toApama(testMetadata, new ConfigBuilder()
        .Name("A config")
        .Description("Some text here")
        .MetadataVersion(testMetadata.version).build()
      );

      const names = TestUtils.findAll(/(\\\\ Name:\s)(.*)/g, result).map(match => match[1]);
      const descriptions = TestUtils.findAll(/(\\\\ Description:\s)(.*)/g, result).map(match => match[1]);
      const version = TestUtils.findAll(/(\\\\ Version:\s)(.*)/g, result).map(match => match[1]);
      expect(names).toEqual(["A config"]);
      expect(descriptions).toEqual(["Some text here"]);
      expect(version).toEqual([testMetadata.version]);
  });

  describe('should serialize a config containing 0 or more rows', () => {
    for (let i = 0; i < 5; i++) {
      it(`RowCount: ${i}`, () => {
        let configBuilder = new ConfigBuilder()
          .Name("A config")
          .Description("Some text here")
          .MetadataVersion(testMetadata.version);

        for (let j = 0; j < i; j++) {
          configBuilder = configBuilder.withRow()
            .MaxTransformerCount(3)
              .withInputChannel(0).Name("Input Channel 1").endWith()
              .withOutputChannel(0).Name("Output Channel 1").endWith()
              .withTransformer().Name("Analytic1").endWith()
              .withTransformer().Name("Analytic2").endWith()
            .endWith()
        }

        const result: string = configSerializer.toApama(testMetadata, configBuilder.build());

        const rowLines = result.split('\n').filter((line) => line.startsWith("\\\\ Row") || line.match(/([\.\w]*Analytic\()(.*)\)/));
        // once filtered the array should contain a row label followed by 2 analytic definitions
        const chunkedRows = _.chunk(rowLines, 3);
        expect(chunkedRows).toBeArrayOfSize(i);
        chunkedRows.forEach((rowLines, z)=> {
          expect(rowLines).toBeArrayOfSize(3);
          expect((rowLines[0].match(/(\\\\ Row:\s)(.*)/) as RegExpMatchArray)[2]).toEqual(z.toString());
          expect((rowLines[1].match(/([\.\w]*Analytic\()(.*)\)/) as RegExpMatchArray)[2]).toEqual(`"Analytic1",["Input Channel 1"],["Row${z}:Channel1"],{}`);
          expect((rowLines[2].match(/([\.\w]*Analytic\()(.*)\)/) as RegExpMatchArray)[2]).toEqual(`"Analytic2",["Row${z}:Channel1"],["Output Channel 1"],{}`);
        })
      })
    }
  })
});

