import {ConfigBuilder, ConfigSerializer} from "./Config";
import {FileService} from "../services/FileService";
import {TransformerSerializer} from "app/classes/Transformer";
import {RowSerializer} from "./Row";
import {PropertySerializer} from "./Property";
import {TestBed} from "@angular/core/testing";
import {TestUtils} from "../services/TestUtil.spec";

describe('ConfigSerializer', () => {

  let fileService: FileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileService,
        ConfigSerializer,
        RowSerializer,
        TransformerSerializer,
        PropertySerializer
      ]
     });
    fileService = TestBed.get(FileService) as FileService;
  });

  it('should handle an empty Config', () => {

    const result = fileService.serialize(new ConfigBuilder().build());
    expect(result).toBe('')
  });

  it('should serialise a valid config with two Analytics', () => {

    const result = fileService.serialize(new ConfigBuilder()
      .Name("Single row with two Analytics each containing one input and output channel")
        .Description("This configuration demonstrates a single row with two Analytics each containing one input and output channel")
        .withRow()
          .MaxTransformerCount(3)
          .withInputChannel().Name("Input Channel 1").endWith()
          .withOutputChannel().Name("Output Channel 1").endWith()
          .withTransformer()
            .Name("Analytic 1")
            .withInputChannel().Name("Analytic 1 : Channel In").endWith()
            .withOutputChannel().Name("Analytic 1: Channel Out").endWith()
            .withProperty().Name("My first property").Description("A property").Type("string").Optional(false).Value("Hello World").endWith()
          .endWith()
          .withTransformer()
            .Name("Analytic 2")
            .withInputChannel().Name("Analytic 2 : Channel In").endWith()
            .withOutputChannel().Name("Analytic 2: Channel Out").endWith()
            .withProperty().Name("My first property").Description("A property").Type("boolean").Optional(false).Value(true).endWith()
          .endWith()
        .endWith()
      .build());
    console.log(result);

    const names = TestUtils.findAll(/(\\\\ Name:\s)(.*)/g, result).map(match => match[1]);
    const descriptions = TestUtils.findAll(/(\\\\ Description:\s)(.*)/g, result).map(match => match[1]);
    expect(names).toBeArrayOfSize(1);
    expect(names[0]).toEqual("Single row with two Analytics each containing one input and output channel");
    expect(descriptions).toBeArrayOfSize(1);
    expect(descriptions[0]).toEqual("This configuration demonstrates a single row with two Analytics each containing one input and output channel");

    const rows = TestUtils.findAll(/(\\\\ Row:\s)(.*)/g, result).map(match => match[1]);
    expect(rows).toEqual(["0"]);

    const analytics = TestUtils.findAll(/([\.\w]*Analytic\()(.*)\)/g, result).map(match => match[1]);
    expect(analytics).toEqual([
      '"Analytic 1",["Input Channel 1"],["Row0:Channel1"],{"My first property":"Hello World"}',
      '"Analytic 2",["Row0:Channel1"],["Output Channel 1"],{"My first property":"true"}'
    ]);

  });
});
