import {TransformerChannelDeserializer} from "./TransformerChannel";
import {PropertyDeserializer} from "./Property";
import {TestBed} from "@angular/core/testing";
import {AbstractMetadataService, MetadataService} from "../services/MetadataService";
import {MetadataBuilder} from "./Metadata";
import {NestedTransformerDefBuilder, TransformerDefBuilder} from "./TransformerDef";
import {TransformerDeserializer} from "./TransformerDeserializer";
import {AbstractDataService} from "../services/AbstractDataService";
import {DataService} from "../services/DataService";

describe('TransformerDeserializer', () => {
  let transformerDeserializer: TransformerDeserializer;
  let metadataService: MetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AbstractDataService, useClass: DataService},
        {provide: AbstractMetadataService, useClass: MetadataService},
        TransformerDeserializer,
        TransformerChannelDeserializer,
        PropertyDeserializer
      ]
    });
    metadataService = TestBed.get(AbstractMetadataService);
    transformerDeserializer = TestBed.get(TransformerDeserializer);
  });

  [
     {
      description: "Required input channel",
      setup: analyticDef => analyticDef
        .withInputChannel().Name("InChan1").endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", ["Input"], [], {})',
      expectedInputs: ["InChan1"],
      expectedOutputs: []
    }, {
      description: "Required output channel",
      setup: analyticDef => analyticDef
        .withOutputChannel().Name("OutChan1").endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], ["Output"], {})',
      expectedInputs: [],
      expectedOutputs: ["OutChan1"]
    }, {
      description: "Optional unprovided input channel",
      setup: analyticDef => analyticDef
        .withInputChannel().Name("InChan1").Optional(true).endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], [], {})',
      expectedInputs: [],
      expectedOutputs: []
    }, {
      description: "Optional unprovided output channel",
      setup: analyticDef => analyticDef
        .withOutputChannel().Name("OutChan1").Optional(true).endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], [], {})',
      expectedInputs: [],
      expectedOutputs: []
    }, {
      description: "Optional provided input channel",
      setup: analyticDef => analyticDef
        .withInputChannel().Name("InChan1").Optional(true).endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", ["Input"], [], {})',
      expectedInputs: ["InChan1"],
      expectedOutputs: []
    }, {
      description: "Optional provided output channel",
      setup: analyticDef => analyticDef
        .withOutputChannel().Name("OutChan1").Optional(true).endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], ["Output"], {})',
      expectedInputs: [],
      expectedOutputs: ["OutChan1"]
    }, {
      description: "Repeated provided input channel",
      setup: analyticDef => analyticDef
        .withInputChannel().Name("InChan1").Repeated(true).endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", ["Input", "Input2"], [], {})',
      expectedInputs: ["InChan1", "InChan1"],
      expectedOutputs: []
    }, {
      description: "Optional provided output channel",
      setup: analyticDef => analyticDef
        .withOutputChannel().Name("OutChan1").Repeated(true).endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], ["Output", "Output2"], {})',
      expectedInputs: [],
      expectedOutputs: ["OutChan1", "OutChan1"]
    }, {
      description: "Optional, Required, Repeated, Required. 2 Input provided",
      setup: analyticDef => analyticDef
        .withInputChannel().Name("InChan1").Optional(true).endWith()
        .withInputChannel().Name("InChan2").endWith()
        .withInputChannel().Name("InChan3").Repeated(true).endWith()
        .withInputChannel().Name("InChan4").endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", ["Input", "Input2"], [], {})',
      expectedInputs: ["InChan2", "InChan4"],
      expectedOutputs: []
    }, {
      description: "Optional, Required, Repeated, Required. 2 Output provided",
      setup: analyticDef => analyticDef
        .withOutputChannel().Name("OutChan1").Optional(true).endWith()
        .withOutputChannel().Name("OutChan2").endWith()
        .withOutputChannel().Name("OutChan3").Repeated(true).endWith()
        .withOutputChannel().Name("OutChan4").endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], ["Output", "Output2"], {})',
      expectedInputs: [],
      expectedOutputs: ["OutChan2", "OutChan4"]
    }, {
      description: "Optional, Required, Repeated, Required. 3 Input provided",
      setup: analyticDef => analyticDef
        .withInputChannel().Name("InChan1").Optional(true).endWith()
        .withInputChannel().Name("InChan2").endWith()
        .withInputChannel().Name("InChan3").Repeated(true).endWith()
        .withInputChannel().Name("InChan4").endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", ["Input", "Input2", "Input3"], [], {})',
      expectedInputs: ["InChan1", "InChan2", "InChan4"],
      expectedOutputs: []
    }, {
      description: "Optional, Required, Repeated, Required. 3 Output provided",
      setup: analyticDef => analyticDef
        .withOutputChannel().Name("OutChan1").Optional(true).endWith()
        .withOutputChannel().Name("OutChan2").endWith()
        .withOutputChannel().Name("OutChan3").Repeated(true).endWith()
        .withOutputChannel().Name("OutChan4").endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], ["Output", "Output2", "Output3"], {})',
      expectedInputs: [],
      expectedOutputs: ["OutChan1", "OutChan2", "OutChan4"]
    }, {
      description: "Optional, Required, Repeated, Required. 5 Input provided",
      setup: analyticDef => analyticDef
        .withInputChannel().Name("InChan1").Optional(true).endWith()
        .withInputChannel().Name("InChan2").endWith()
        .withInputChannel().Name("InChan3").Repeated(true).endWith()
        .withInputChannel().Name("InChan4").endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", ["Input", "Input2", "Input3", "Input4", "Input5"], [], {})',
      expectedInputs: ["InChan1", "InChan2", "InChan3", "InChan3", "InChan4"],
      expectedOutputs: []
    }, {
      description: "Optional, Required, Repeated, Required. 5 Output provided",
      setup: analyticDef => analyticDef
        .withOutputChannel().Name("OutChan1").Optional(true).endWith()
        .withOutputChannel().Name("OutChan2").endWith()
        .withOutputChannel().Name("OutChan3").Repeated(true).endWith()
        .withOutputChannel().Name("OutChan4").endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], ["Output", "Output2", "Output3", "Output4", "Output5"], {})',
      expectedInputs: [],
      expectedOutputs: ["OutChan1", "OutChan2", "OutChan3", "OutChan3", "OutChan4"]
    }, {
      description: "Repeated, Optional. 3 Input provided",
      setup: analyticDef => analyticDef
        .withInputChannel().Name("InChan1").Repeated(true).endWith()
        .withInputChannel().Name("InChan2").Optional(true).endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", ["Input", "Input2", "Input3"], [], {})',
      expectedInputs: ["InChan1", "InChan1", "InChan1"],
      expectedOutputs: []
    }, {
      description: "Repeated, Optional. 3 Output provided",
      setup: analyticDef => analyticDef
        .withOutputChannel().Name("OutChan1").Repeated(true).endWith()
        .withOutputChannel().Name("OutChan2").Optional(true).endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], ["Output", "Output2", "Output3"], {})',
      expectedInputs: [],
      expectedOutputs: ["OutChan1", "OutChan1", "OutChan1"]
    }, {
      description: "Optional, Repeated, Required, Repeated (Prefixed). 6 Inputs provided",
      setup: analyticDef => analyticDef
        .withInputChannel().Name("InChan1").Optional(true).endWith()
        .withInputChannel().Name("InChan2").endWith()
        .withInputChannel().Name("InChan3").Repeated(true).Prefix("Prefix:").endWith()
        .withInputChannel().Name("InChan4").Repeated(true).endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", ["Prefix:Input", "Input2", "Prefix:Input3", "Input4", "Input5", "Input6"], [], {})',
      expectedInputs: ["InChan1", "InChan2", "InChan3", "InChan3", "InChan4", "InChan4"],
      expectedOutputs: []
    }, {
      description: "Optional, Repeated, Required, Repeated (Prefixed). 6 Outputs provided",
      setup: analyticDef => analyticDef
        .withOutputChannel().Name("OutChan1").Optional(true).endWith()
        .withOutputChannel().Name("OutChan2").endWith()
        .withOutputChannel().Name("OutChan3").Repeated(true).Prefix("Prefix:").endWith()
        .withOutputChannel().Name("OutChan4").Repeated(true).endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], ["Prefix:Output", "Output2", "Prefix:Output3", "Output4", "Output5", "Output6"], {})',
      expectedInputs: [],
      expectedOutputs: ["OutChan1", "OutChan2", "OutChan3", "OutChan3", "OutChan4", "OutChan4"]
    }, {
      description: "Optional(Prefixed), Optional(Prefixed). 2 Inputs provided",
      setup: analyticDef => analyticDef
        .withInputChannel().Name("InChan1").Optional(true).Prefix("P1:").endWith()
        .withInputChannel().Name("InChan2").Optional(true).Prefix("P2:").endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", ["P2:Input", "P1:Input2"], [], {})',
      expectedInputs: ["InChan1", "InChan2"],
      expectedOutputs: []
    }, {
      description: "Optional(Prefixed), Optional(Prefixed). 2 Outputs provided",
      setup: analyticDef => analyticDef
        .withOutputChannel().Name("OutChan1").Optional(true).Prefix("P1:").endWith()
        .withOutputChannel().Name("OutChan2").Optional(true).Prefix("P2:").endWith(),
      analyticString: 'com.industry.analytics.Analytic("MyAnalytic", [], ["P2:Output", "P1:Output2"], {})',
      expectedInputs: [],
      expectedOutputs: ["OutChan1", "OutChan2"]
    }
  ].forEach(testCase => {
    it(testCase.description, () => {
      const metadata = (testCase.setup(new MetadataBuilder().withAnalytic().Name('MyAnalytic') as TransformerDefBuilder) as NestedTransformerDefBuilder<MetadataBuilder>).endWith().build();
      metadataService.metadata.next(metadata);

      const {analytic, inChannels, outChannels} = transformerDeserializer.buildAnalytic(testCase.analyticString);
      expect(analytic.inputChannels.toArray().map(chan => chan.name)).toEqual(testCase.expectedInputs);
      expect(analytic.outputChannels.toArray().map(chan => chan.name)).toEqual(testCase.expectedOutputs);
    })
  });
});
