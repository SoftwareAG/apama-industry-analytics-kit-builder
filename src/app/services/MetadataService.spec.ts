
import {TestBed} from "@angular/core/testing";
import {AbstractMetadataService, MetadataService} from "./MetadataService";

describe('MetadataService', () => {
  let metadataService: MetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AbstractMetadataService, useClass: MetadataService}
      ]
    });
    metadataService = TestBed.get(AbstractMetadataService) as MetadataService;
  });

  it('should correctly parse a valid metadata json object', () => {
    metadataService.loadMetadata({
      version: "2.0.0.0",
      groupOrder: [],
      analytics: [{
        name: "TestTransformer",
        description: "TestTransformer Description",
        group: "",
        documentation: "TestTransformer Documentation"
      }]
    });
    expect(metadataService.metadata.getValue().analytics.toArray()).toBeArrayOfSize(1);
  });

  it('should correctly parse the Spike Analytic metadata', () => {

    metadataService.loadMetadata( {
      version: "2.0.0.0",
      groupOrder: [],
      analytics: [        {
        "description": "Automatically detect unusual spikes in a data stream.",
        "documentation": "Test documentation",
        "group": "Detectors",
        "inputChannels": [
          {
            "dataProperties": [
              "dValue"
            ],
            "description": "The channel to check for spikes",
            "name": "Data"
          }
        ],
        "name": "Spike",
        "outputChannels": [
          {
            "dataProperties": [
              "+dValue"
            ],
            "description": "The channel on which to output spike anomalies",
            "name": "Spikes"
          },
          {
            "dataProperties": [
              "+dValue",
              "-sValue",
              "-xValue",
              "-yValue",
              "-zValue",
              "-params"
            ],
            "description": "The channel on which to output the moving average",
            "name": "Moving Average",
            "optional": true,
            "prefix": "avg:",
            "type": "string"
          },
          {
            "dataProperties": [
              "+dValue",
              "-sValue",
              "-xValue",
              "-yValue",
              "-zValue",
              "-params"
            ],
            "description": "The channel on which to output the moving average",
            "name": "Variance",
            "optional": true,
            "prefix": "variance:",
            "type": "string"
          },
          {
            "dataProperties": [
              "+dValue",
              "-sValue",
              "-xValue",
              "-yValue",
              "-zValue",
              "-params"
            ],
            "description": "The channel on which to output the Standard deviation",
            "name": "Standard Deviation",
            "optional": true,
            "prefix": "stddev:",
            "type": "string"
          },
          {
            "dataProperties": [
              "+dValue",
              "-sValue",
              "-xValue",
              "-yValue",
              "-zValue",
              "-params"
            ],
            "description": "The channel on which to output the upper boundary",
            "name": "Upper",
            "optional": true,
            "prefix": "upper:",
            "type": "string"
          },
          {
            "dataProperties": [
              "+dValue",
              "-sValue",
              "-xValue",
              "-yValue",
              "-zValue",
              "-params"
            ],
            "description": "The channel on which to output the lower boundary",
            "name": "Lower",
            "optional": true,
            "prefix": "lower:",
            "type": "string"
          }
        ],
        "properties": [
          {
            "defaultValue": "60.0d",
            "description": "The time window (in seconds) that moving average is calculated on",
            "name": "timeWindow",
            "type": "decimal",
            "validator": "function(value) { return value > 0 || 'Value must be greater than 0' }"
          },
          {
            "advanced": true,
            "defaultValue": "2.0d",
            "description": "Sets the width of the Nominal Range in STDDEV",
            "name": "standardDeviationMultiple",
            "type": "decimal",
            "validator": "function(value) { return value > 0 || 'Value must be greater than 0' }"
          },
          {
            "advanced": true,
            "defaultValue": false,
            "description": "Enables/Disables the verbose mode so that computed values are generated as well as anomaly values.",
            "name": "verbose",
            "type": "boolean"
          }
        ]
      }]
    });

    expect(metadataService.metadata.getValue().analytics.toArray()).toBeArrayOfSize(1);

    const analytic = metadataService.metadata.getValue().analytics.toArray()[0];
    expect(analytic.properties.toArray()).toBeArrayOfSize(3);

    const analyticInputChannelsArray = analytic.inputChannels.toArray();
    expect(analyticInputChannelsArray).toBeArrayOfSize(1);
    expect(analyticInputChannelsArray[0].dataProperties).toBeArrayOfSize(1);

    const analyticOutputChannelsArray = analytic.outputChannels.toArray();
    expect(analyticOutputChannelsArray).toBeArrayOfSize(6);
    expect(analyticOutputChannelsArray[0].dataProperties).toBeArrayOfSize(1);
    expect(analyticOutputChannelsArray[1].dataProperties).toBeArrayOfSize(6);
    expect(analyticOutputChannelsArray[1].optional).toEqual(true);
    expect(analyticOutputChannelsArray[1].prefix).toEqual('avg:');
    expect(analyticOutputChannelsArray[1].repeated).toEqual(false);
    expect(analyticOutputChannelsArray[1].type).toEqual('string');
    expect(analyticOutputChannelsArray[2].dataProperties).toBeArrayOfSize(6);
    expect(analyticOutputChannelsArray[3].dataProperties).toBeArrayOfSize(6);
    expect(analyticOutputChannelsArray[4].dataProperties).toBeArrayOfSize(6);
    expect(analyticOutputChannelsArray[5].dataProperties).toBeArrayOfSize(6);

    const analyticPropertiesArray = metadataService.metadata.getValue().analytics.toArray()[0].properties.toArray();
    expect(analyticPropertiesArray[0].name).toEqual('timeWindow');
    expect(analyticPropertiesArray[0].defaultValue).toEqual('60.0d');
    expect(analyticPropertiesArray[0].advanced).toEqual(false);
    expect(analyticPropertiesArray[1].name).toEqual('standardDeviationMultiple');
    expect(analyticPropertiesArray[1].defaultValue).toEqual('2.0d');
    expect(analyticPropertiesArray[1].advanced).toEqual(true);
    expect(analyticPropertiesArray[2].name).toEqual('verbose');
    expect(analyticPropertiesArray[2].defaultValue).toEqual(false);
    expect(analyticPropertiesArray[2].advanced).toEqual(true);

  })

});
