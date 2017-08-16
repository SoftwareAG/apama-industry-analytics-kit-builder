import {FileService} from "./FileService";
import {TestBed} from "@angular/core/testing";
import {Config, ConfigSerializer} from "../classes/Config";
import {TransformerSerializer} from "app/classes/Transformer";
import {RowSerializer} from "../classes/Row";
import {PropertyDeserializer, PropertySerializer} from "../classes/Property";
import {AbstractMetadataService, MetadataService} from "./MetadataService";
import {TransformerChannelDeserializer} from "../classes/TransformerChannel";
import {ConfigDeserializer} from "../classes/ConfigDeserializer";
import {RowDeserializer} from "../classes/RowDeserializer";
import {AbstractDataService} from "./AbstractDataService";
import {DataService} from "./DataService";
import {TransformerDeserializer} from "../classes/TransformerDeserializer";

describe('FileService', () => {

  let metadataService: MetadataService;
  let fileService: FileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileService,
        ConfigSerializer,
        RowSerializer,
        TransformerSerializer,
        PropertySerializer,
        {provide: AbstractDataService, useClass: DataService},
        {provide: AbstractMetadataService, useClass: MetadataService},
        PropertySerializer,
        ConfigDeserializer,
        RowDeserializer,
        TransformerDeserializer,
        TransformerChannelDeserializer,
        PropertyDeserializer
      ]
    });
    fileService = TestBed.get(FileService) as FileService;
    metadataService = TestBed.get(AbstractMetadataService) as MetadataService;

    metadataService.loadMetadata({
      version: "2.0.0.0",
      groupOrder: [],
      analytics: [{
        description: "Suppress events after a triggering event.",
        group: "Flow Manipulation",
        name: "Suppressor",
        inputChannels: [
          { name: "Data", description: "" }
        ],
        outputChannels: [
          { name: "Suppressed Data", description: "Suppressed data channel" }
        ],
        properties: [
          {
            description: "How long to suppress events for.",
            name: "timeWindow",
            type: "decimal",
            validator: "function(value) { return value > 0 || 'Must be greater than 0' }"
          },{
            description: "A param to identify when to start suppressing the output events.",
            name: "triggerParam",
            type: "string",
            validator: "function(value) { return value.length > 0 || 'Must have a value' }"
          },{
            description: "A test param for checking boolean type.",
            name: "testBoolean",
            type: "boolean"
          }
        ]
      },{
        description: "Sort incoming events by their timestamp.",
        group: "Flow Manipulation",
        inputChannels: [
        {
          description: "The channel to sort",
          name: "Data"
        }],
        name: "Sorter",
        outputChannels: [
        {
          description: "Sorted data channel",
          name: "Sorted Data"
        }],
        properties: [
        {
          description: "How long to delay events, allowing them to be sorted.",
          name: "timeWindow",
          type: "decimal",
          validator: "function(value) { return value > 0 || 'Must be greater than 0' }"
        }]
      },{
        description: "Generate a set of 'X' new Data events for each incoming event, at 'Y' seconds apart and with value 'Z'.",
        group: "Flow Manipulation",
        name: "Slicer",
        inputChannels: [
          { name: "Data", description: "" }
        ],
        outputChannels: [
          { name: "Slices", description: "" }
        ],
        properties: [{
            description: "The dValue for each slice.",
            name: "byValue",
            optional: true,
            type: "decimal",
            validator: "function(value) { return value > 0 || 'Must be greater than 0' }"
          },{
            description: "The number of slices.",
            name: "byCount",
            optional: true,
            type: "decimal",
            validator: "function(value) { return value > 0 && value % 1 === 0 || 'Must be an integer greater than 0' }"
          },{
            description: "The time between slices.",
            name: "timeInterval",
            type: "decimal",
            validator: "function(value) { return value >= 0 || 'Must be greater than or equal to 0' }"
          }
        ]
      },{
        "description": "Detect data outside a corridor.",
        "group": "Detectors",
        "name": "Corridor",
        "inputChannels": [
          {
            "description": "The channel to check",
            "name": "Data"
          }
        ],
        "outputChannels": [
          {
            "description": "The channel on which to output anomalies",
            "name": "Breach"
          }
        ],
        "properties": [
          {
            "description": "Defines the upper threshold value that is used to detect breaches",
            "name": "upperThreshold",
            "type": "decimal"
          },
          {
            "description": "Defines the lower threshold value that is used to detect breaches",
            "name": "lowerThreshold",
            "type": "decimal"
          },
          {
            "description": "Defines whether to check for data inside or outside the corridor",
            "name": "zone",
            "type": "string",
            "validValues": [
              "inside",
              "outside"
            ]
          },
          {
            "defaultValue": 0,
            "description": "Defines how long (in seconds) the threshold may be breached before an Anomaly Data is generated. If the value is 0.0d then the Anomaly Data is generated immediately.",
            "name": "duration",
            "optional": true,
            "type": "decimal",
            "validator": "function(value) { return value >= 0 || 'Value must be greater than or equal to 0' }"
          }
        ]
      },{
        "description": "Combines multiple data streams into a single stream.",
        "group": "Flow Manipulation",
        "name": "Combiner",
        "properties": [
          {
            "description": "Modify all data events to use this sourceId",
            "name": "aggregatedSourceId",
            "optional": true,
            "type": "string",
            "validator": "function(value) { return value.length > 0 | 'Must not be empty' }"
          }
        ],
        "inputChannels": [
          {
            "description": "The channels to combine",
            "name": "Data",
            "repeated": true
          }
        ],
        "outputChannels": [
          {
            "description": "The combined data channel",
            "name": "Combined"
          }
        ],
      },
        {
          "description": "Generates a Data containing a moving average calculation for each input Data received.",
          "group": "Streaming Calculations",
          "inputChannels": [
            {
              "description": "The channel used to calculate a moving average",
              "name": "Data",
              "optional": true
            }
          ],
          "name": "Average",
          "outputChannels": [
            {
              "description": "The channel where moving average data is output",
              "name": "Average"
            }
          ],
          "properties": [
            {
              "defaultValue": "60.0d",
              "description": "Defines the time window to calculate the moving average over",
              "name": "timeWindow",
              "type": "decimal",
              "validator": "function(value) { return value > 0 || 'Value must be greater than 0.0' }"
            }
          ]
        },{
          "description": "The Spread Analytic calculates a new Data event from the spread between the values on the current Data and the value on previously received Data events.",
          "group": "Streaming Calculations",
          "inputChannels": [
            {
              "description": "The channel used to calculate the spread across the sourceIds",
              "name": "Data",
              "repeated": true
            }
          ],
          "name": "Spread",
          "outputChannels": [
            {
              "description": "The channel to output spread data",
              "name": "Spread"
            }
          ],
          "properties": [
            {
              "defaultValue": false,
              "description": "Defines whether only anomalies should be output. Can only be specified if a spreadThreshold is defined",
              "name": "anomaliesOnly",
              "optional": true,
              "type": "boolean"
            },
            {
              "description": "The maximum nominal spread. A greater spread will trigger anomaly output Data events",
              "name": "spreadThreshold",
              "optional": true,
              "type": "decimal"
            }
          ]
        },{
          "description": "Detect data above or below a threshold.",
          "group": "Detectors",
          "inputChannels": [
            {
              "description": "The channel to check for threshold breaches",
              "name": "Data"
            },
            {
              "description": "Channel recieving updates to the threshold value",
              "name": "Threshold Updates",
              "optional": true
            }
          ],
          "name": "Threshold",
          "outputChannels": [
            {
              "description": "The channel on which to output threshold breaches",
              "name": "Breaches"
            }
          ],
          "properties": [
            {
              "description": "The threshold value that is used to detect breaches",
              "name": "threshold",
              "type": "decimal"
            },
            {
              "description": "Whether to check for crossing, falling or rising threshold breaches",
              "name": "direction",
              "type": "string",
              "validValues": [
                "crossing",
                "falling",
                "rising"
              ]
            },
            {
              "defaultValue": 0,
              "description": "How long (in seconds) the threshold may be breached before an Anomaly Data is generated. If value=0.0d, then Anomaly Data is generated immediately.",
              "name": "duration",
              "optional": true,
              "type": "decimal",
              "validator": "function(value) { return value >= 0 || 'Value must be greater than or equal to 0' }"
            },
            {
              "defaultValue": 1,
              "description": "The maximum number of times an Anomaly Data is generated for the breach before stopping checking. A value of 0 indicates unlimited repeats.",
              "name": "repeats",
              "optional": true,
              "type": "integer",
              "validator": "function(value) { return value >= 0 || 'Value must be greater than or equal to 0' }"
            },
            {
              "defaultValue": false,
              "description": "Whether to check for threshold breaches when the threshold is updated. This has the potential to be an expensive operation as the check would need to be done for each sourceId being monitored. This parameter is ignored is only one inputData is provided.",
              "name": "checkBreachesOnThresholdUpdate",
              "optional": true,
              "type": "boolean"
            }
          ]
        }, {
          "description": "Connect to PMML predictive model.",
          "documentation": "Prediction Documentation",
          "group": "Extensions",
          "inputChannels": [
            {
              "description": "An input to the PMML model",
              "name": "Data",
              "repeated": true
            }
          ],
          "name": "Prediction",
          "outputChannels": [
            {
              "dataProperties": [
                "+dValue",
                "+sValue",
                "+xValue",
                "+yValue",
                "+zValue",
                "+params"
              ],
              "description": "An output from the PMML model",
              "name": "PMML Output"
            }
          ],
          "properties": [
            {
              "advanced": true,
              "defaultValue": false,
              "description": "Defines whether the output Data events have a combination of all the params in the Data events used for the calculation (true) or just the params from the input Data from the alphabetically first input stream (false). The latter is more performant.",
              "name": "combineParams",
              "optional": true,
              "type": "boolean"
            },
            {
              "description": "The name of the model to be used within the PMML file.",
              "name": "modelName",
              "type": "string",
              "validator": "function(value) { return value.trim().length > 0 || 'Must provide a model name' }"
            },
            {
              "advanced": true,
              "defaultValue": "Current working directory",
              "description": "Defines whether to check for data inside or outside the corridor. Required when the model file is not in the working directory.",
              "name": "pmmlFileDirectory",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.trim().length > 0 || 'Must provide a pmml directory name' }"
            },
            {
              "description": "The file containing the PMML model.",
              "name": "pmmlFileName",
              "type": "string",
              "validator": "function(value) { return value.trim().length > 0 || 'Must provide a file name' }"
            },
            {
              "defaultValue": true,
              "description": "Whether the input stream Data events should be dealt with synchronously or as they arrive.",
              "name": "synchronous",
              "optional": true,
              "type": "boolean"
            },
            {
              "description": "The mapping of an input and output parameters for the PMML model to a value within one of the input or output Data events. See documentation for further details on the syntax.",
              "name": "input / output parameter name",
              "repeated": true,
              "type": "string"
            }
          ]
        }, {
          "description": "Filter events by a condition.",
          "documentation": "Filter Documentation",
          "group": "Flow Manipulation",
          "inputChannels": [
            {
              "description": "The channel to filter",
              "name": "Data"
            }
          ],
          "name": "Filter",
          "outputChannels": [
            {
              "description": "The channel on which to output filtered data",
              "name": "Filtered"
            }
          ],
          "properties": [
            {
              "description": "Event must have any of these sourceIds. eg. [\"sourceId1\"]",
              "name": "sourceId",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^\\[\\s*((\"[^\"]*\"\\s*,\\s*)*(\"[^\"]*\"))?\\s*\\]$/g) || 'Value must be a stringified sequence eg. [\"abc\"]' }"
            },
            {
              "description": "Event must not have any of these sourceIds. eg. [\"sourceId1\"]",
              "name": "!sourceId",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^\\[\\s*((\"[^\"]*\"\\s*,\\s*)*(\"[^\"]*\"))?\\s*\\]$/g) || 'Value must be a stringified sequence eg. [\"abc\"]' }"
            },
            {
              "description": "Event must have any of these params. eg. [\"param1\"]",
              "name": "hasParam",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^\\[\\s*((\"[^\"]*\"\\s*,\\s*)*(\"[^\"]*\"))?\\s*\\]$/g) || 'Value must be a stringified sequence eg. [\"abc\"]' }"
            },
            {
              "description": "Event must not have any of these params. eg. [\"param1\"]",
              "name": "!hasParam",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^\\[\\s*((\"[^\"]*\"\\s*,\\s*)*(\"[^\"]*\"))?\\s*\\]$/g) || 'Value must be a stringified sequence eg. [\"abc\"]' }"
            },
            {
              "description": "Event must have any of these string values. eg. [\"abc\"]",
              "name": "sValue",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^\\[\\s*((\"[^\"]*\"\\s*,\\s*)*(\"[^\"]*\"))?\\s*\\]$/g) || 'Value must be a stringified sequence eg. [\"abc\"]' }"
            },
            {
              "description": "Event must not have any of these string values. eg. [\"abc\"]",
              "name": "!sValue",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^\\[\\s*((\"[^\"]*\"\\s*,\\s*)*(\"[^\"]*\"))?\\s*\\]$/g) || 'Value must be a stringified sequence eg. [\"abc\"]' }"
            },
            {
              "description": "Event must have any of these types. (Raw, Computed, Anomaly) eg. [\"r\", \"c\", \"a\"]",
              "name": "type",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^\\s*\\[((\"[rca]\"\\s*,\\s*)*(\"[rca]\"))?\\s*\\]$/g) || 'Value must be a stringified sequence of r (Raw), c (Computed), or a (Anomaly) eg. [\"r\"]' }"
            },
            {
              "description": "Event must not have any of these types. (Raw, Computed, Anomaly) eg. [\"r\", \"c\", \"a\"]",
              "name": "!type",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^\\s*\\[((\"[rca]\"\\s*,\\s*)*(\"[rca]\"))?\\s*\\]$/g) || 'Value must be a stringified sequence of r (Raw), c (Computed), or a (Anomaly) eg. [\"r\"]' }"
            },
            {
              "description": "Check that the event's dValue meets a condition. Eg. '> 5.0'",
              "name": "dValue",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^(((<|>)=?|=)( +\\d+(\\.\\d+)?)|(<=?>|>=?<) +\\d+(\\.\\d+)?( +| *, *)\\d+(\\.\\d+)?)$/g) || 'Value must be a valid condition eg. >= 5.0' }"
            },
            {
              "advanced": true,
              "description": "Check that the event's xValue meets a condition. Eg. '> 5.0'",
              "name": "xValue",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^(((<|>)=?|=)( +\\d+(\\.\\d+)?)|(<=?>|>=?<) +\\d+(\\.\\d+)?( +| *, *)\\d+(\\.\\d+)?)$/g) || 'Value must be a valid condition eg. >= 5.0' }"
            },
            {
              "advanced": true,
              "description": "Check that the event's yValue meets a condition. Eg. '> 5.0'",
              "name": "yValue",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^(((<|>)=?|=)( +\\d+(\\.\\d+)?)|(<=?>|>=?<) +\\d+(\\.\\d+)?( +| *, *)\\d+(\\.\\d+)?)$/g) || 'Value must be a valid condition eg. >= 5.0' }"
            },
            {
              "advanced": true,
              "description": "Check that the event's zValue meets a condition. Eg. '> 5.0'",
              "name": "zValue",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^(((<|>)=?|=)( +\\d+(\\.\\d+)?)|(<=?>|>=?<) +\\d+(\\.\\d+)?( +| *, *)\\d+(\\.\\d+)?)$/g) || 'Value must be a valid condition eg. >= 5.0' }"
            },
            {
              "advanced": true,
              "description": "Check that the event's sourceId is a leaf node (in the DataSource hierarchy) of one of these dataSources. Eg. [\"ParentSource1\"]",
              "name": "sourceId_OnlyLeafNodes",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^\\[\\s*((\"[^\"]*\"\\s*,\\s*)*(\"[^\"]*\"))?\\s*\\]$/g) || 'Value must be a stringified sequence eg. [\"abc\"]' }"
            },
            {
              "advanced": true,
              "description": "Check that the event's sourceId is a child or nested child (in the DataSource hierarchy) of one of these dataSources. Eg. [\"ParentSource1\"]",
              "name": "sourceId_AllChildren",
              "optional": true,
              "type": "string",
              "validator": "function(value) { return value.match(/^\\[\\s*((\"[^\"]*\"\\s*,\\s*)*(\"[^\"]*\"))?\\s*\\]$/g) || 'Value must be a stringified sequence eg. [\"abc\"]' }"
            },
            {
              "advanced": true,
              "description": "Defines the id used for management of the analytic",
              "name": "managementId",
              "optional": true,
              "type": "string"
            }
          ]
        }]
    });
  });

  it('should error if no EPL is provided', () => {
    expect( () => { fileService.deserializeConfig(""); }).toThrowError();
  });

  it('should error if no name has been provided in the .evt file', () => {
    const apama = `\\\\ Description: Sample configuration description
\\\\ Version: 2.0.0.0`;
    expect( () => { fileService.deserializeConfig(apama); }).toThrowError();
  });

  it('should error if empty Name is provided in the .evt file', () => {
    const apama = `\\\\ Name:  
\\\\ Description: No Name data provided
\\\\ Version: 2.0.0.0`;
    expect( () => { fileService.deserializeConfig(apama); }).toThrowError();
  });

  it('should parse if no rows exist in the .evt file', () => {
    const apama = `\\\\ Name: No Rows 
\\\\ Description: Sample configuration description
\\\\ Version: 2.0.0.0`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(0);
  });

  it('should parse correctly if provided with rows with no analytics (ignores the rows)', () => {
    const apama = `\\\\ Name: One row with no analytics
\\\\ Description: Sample configuration description
\\\\ Version: 2.0.0.0
\\\\ Row: 0
\\\\ Row: 1
\\\\ Row: 2`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(0);
  });

  it('should parse correctly if no Description is provided', () => {
    const apama = `\\\\ Name: No Description provided
\\\\ Version: 2.0.0.0
\\\\ Row: 0`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.description.getValue()).toEqual("");
  });

  it('should parse correctly if provided with a row with analytics', () => {
    const apama = `\\\\ Name: Single row with three analytics
\\\\ Description: This configuration demonstrates a single rows containing three analytics
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
  });

  it('should parse correctly if provided with a row with duplicate analytics', () => {
    const apama = `\\\\ Name: Three rows with duplicate Analytics
\\\\ Description: This configuration demonstrates a single row with duplicate analytics
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
  });

  it('should parse correctly if provided with 2 rows each with three analytics', () => {
    const apama = `\\\\ Name: Two rows with multiple analytics
\\\\ Description: This configuration demonstrates multiple rows containing analytics
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})

\\\\ Row: 1
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(2);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
    expect(config.rows.getValue().last().transformers.getValue().size).toEqual(3);
  });

  it('should ignore Rows which do not contain any analytics', () => {
    const apama = `\\\\ Name: Ignore Rows which do not contain any analytics
\\\\ Description: Ignore Rows which do not contain any analytics
\\\\ Version: 2.0.0.0
\\\\ Row: 0

\\\\ Row: 1
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
  });

  it('should parse correctly if provided with out of sequence row numbers', () => {
    const apama = `\\\\ Name: Two out of sequence rows
\\\\ Description: Two out of sequence rows
\\\\ Version: 2.0.0.0
\\\\ Row: 2
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})

\\\\ Row: 1
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(2);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
    expect(config.rows.getValue().last().transformers.getValue().size).toEqual(3);
  });

  it('should parse correctly if provided with duplicate row numbers each with three analytics', () => {
    const apama = `\\\\ Name: Duplicate row numbers with three analytics
\\\\ Description: Duplicate row numbers with three analytics
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})

\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(2);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
    expect(config.rows.getValue().last().transformers.getValue().size).toEqual(3);
  });

  it('should ignore commented out lines in the .evt file', () => {
    const apama = `\\\\ Name: Three rows with complex Analytic and channel configurations
\\\\ Description: Three rows with commented out lines
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
\\\\ com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
\\\\ com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})

\\\\ Row: 1
\\\\com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})

\\\\\\\\ Row: 2
\\\\ com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
\\\\com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
\\\\com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(2);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(1);
    expect(config.rows.getValue().last().transformers.getValue().size).toEqual(2);
  });

  it('should assume row 0 if an "Analytic line" is read before a "Row" line in the .evt file', () => {
    const apama = `\\\\ Name: Analytic before a Row
\\\\ Description: Analytic before a Row
\\\\ Version: 2.0.0.0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
\\\\ com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
\\\\ com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(1);
  });

  it('should error if an invalid Analytic name is provided', () => {
    const apama = `\\\\ Name: Invalid Analytic
\\\\ Description: Invalid Analytic
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("InvalidAnalyticName",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})`;
  expect( () => { fileService.deserializeConfig(apama); }).toThrowError("Analytic 'InvalidAnalyticName' not found in definitions");
  });

  it('should error if an Analytic is provided with an incorrect property name', () => {
    const apama = `\\\\ Name: Invalid Analytic
\\\\ Description: Invalid Analytic
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"invalidPropertyName":"10.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(1);
  });

  it('should error if an Analytic is provided with an invalid property', () => {
    const apama = `\\\\ Name: Invalid Analytic
\\\\ Description: Invalid Analytic
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"invalidPropertyName"})`;
  expect( () => { fileService.deserializeConfig(apama); }).toThrowError('Properties in Slicer is not valid : {"invalidPropertyName"}');
  });

  it('should error if an Analytic is provided with an incorrect property string value for the decimal property type', () => {
    const apama = `\\\\ Name: Invalid Analytic
\\\\ Description: Invalid Analytic
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow": "ABC"})`;
  expect( () => { fileService.deserializeConfig(apama); }).toThrowError(`Property value "ABC" cannot be converted to the required property decimal type`);
  });

  it('should error if an Analytic is provided with an incorrect property value for the property type', () => {
    const apama = `\\\\ Name: Invalid Analytic
\\\\ Description: Invalid Analytic
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"testBoolean": "ABC"})`;
  expect( () => { fileService.deserializeConfig(apama); }).toThrowError('Unable to parse "ABC" to boolean');
  });

  it('should pass even where no properties exist for an Analytic', () => {
    const apama = `\\\\ Name: New one
\\\\ Description: new one description
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Combiner",["Row0:Input0"],["Row0:Channel1"],{})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect( config.rows.getValue().first().transformers.getValue().first().name).toEqual('Combiner');
    expect(config.rows.getValue().last().transformers.getValue().first().propertyValues.size).toEqual(0);
  });

  it('should parse sequence string properties', () => {
    const apama = `\\\\ Name: New one
\\\\ Description: new one description
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Filter",["Row0:Input0"],["Row0:Channel1"],{"sourceId":"[\"sourceId1\", \"sourceId2\"]","!sourceId" : "[\"sourceId3\",\"sourceId4\"]"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().first().transformers.getValue().first().name).toEqual('Filter');
    expect(config.rows.getValue().last().transformers.getValue().first().propertyValues.size).toEqual(2);
  });

  it('should parse sequence and non sequence properties', () => {
    const apama = `\\\\ Name: New one
\\\\ Description: new one description
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Filter",["Row0:Input0"],["Row0:Channel1"],{"sourceId":"[\"sourceId1\"]","!sourceId" : "[\"sourceId2\"]" , "sValue" : " [ \"a\" , \" b \" ] ","!hasParam":"[\"1\",\"2\",\"3\",\"4\",\"5\"]","sourceId_OnlyLeafNodes":"["my_id"]" })`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().first().transformers.getValue().first().name).toEqual('Filter');
    expect(config.rows.getValue().last().transformers.getValue().first().propertyValues.size).toEqual(5);
    debugger;
  });

  it('should parse multiple properties in an Analytic', () => {
    const apama = `\\\\ Name: my config
\\\\ Description: with a description
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Corridor",["Row0:Channel1"],["Row0"],{"upperThreshold":"20.0d","lowerThreshold":"10.0d","zone":"outside","duration":"5.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect( config.rows.getValue().first().transformers.getValue().size).toEqual(1);
    expect(config.rows.getValue().last().transformers.getValue().first().propertyValues.size).toEqual(4);
    expect(config.rows.getValue().last().transformers.getValue().first().getPropertyValues("upperThreshold").get(0).value.getValue()).toEqual(20);
    expect(config.rows.getValue().last().transformers.getValue().first().getPropertyValues("lowerThreshold").get(0).value.getValue()).toEqual(10);
    expect(config.rows.getValue().last().transformers.getValue().first().getPropertyValues("zone").get(0).value.getValue()).toEqual("outside");
    expect(config.rows.getValue().last().transformers.getValue().first().getPropertyValues("duration").get(0).value.getValue()).toEqual(5.0);
  });

  xit('should create the row input and output channels based on the Analytics on the row', () => {
    const apama = `\\\\ Name: Peer Analysis
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Average",["Orders"],["Moving Average"],{"timeWindow":"0.0d"})

\\\\ Row: 1
com.industry.analytics.Analytic("Spread",["Moving Average", "Orders"],["Row1:Channel1"],{"anomaliesOnly":"false","spreadThreshold":"0.0d"})
com.industry.analytics.Analytic("Threshold",["Row1:Channel1","Row1:Channel1"],["Outliers"],{"threshold":"100.0d","direction":"crossing","duration":"10.0d"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(2);
    expect( config.rows.getValue().first().transformers.getValue().size).toEqual(1);
    expect( config.rows.getValue().first().inputChannelOverrides.getValue().get(0).name.getValue()).toEqual('Orders');
    expect( config.rows.getValue().first().outputChannelOverrides.getValue().get(0).name.getValue()).toEqual('Moving Average');
    expect( config.rows.getValue().last().transformers.getValue().size).toEqual(2);
    expect( config.rows.getValue().last().inputChannelOverrides.getValue().get(0).name.getValue()).toEqual('Moving Average');
    expect( config.rows.getValue().last().inputChannelOverrides.getValue().get(1).name.getValue()).toEqual('Orders');
    expect( config.rows.getValue().last().outputChannelOverrides.getValue().get(0).name.getValue()).toEqual('Outliers');
  });

  it('should create the repeated properties for the Prediction analytic', () => {
    const apama = `\\\\ Name: Sample
\\\\ Version: 2.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Prediction",["setting1","setting2","s2"],["RUL_PREDICTION"],{"modelName":"principal_component_model","pmmlFileName":"osi_pca_model.pmml","synchronous":"true","pmmlFileDirectory":"./model","combineParams":"false","setting1":"setting1.DVALUE","setting2":"setting2.DVALUE","s2":"s2.DVALUE","Predicted_PC1":"RUL_PREDICTION.DVALUE"})`;
    const config: Config = fileService.deserializeConfig(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect( config.rows.getValue().first().transformers.getValue().size).toEqual(1);

    // Check all properties have been loaded
    const analyticProperties = config.rows.getValue().first().transformers.getValue().get(0).propertyValues.toArray();
    expect(analyticProperties).toBeArrayOfSize(9);
    expect(analyticProperties[5].definitionName).toEqual('input / output parameter name');
    expect(analyticProperties[5].value.getValue()).toEqual('setting1.DVALUE');
    expect(analyticProperties[6].definitionName).toEqual('input / output parameter name');
    expect(analyticProperties[6].value.getValue()).toEqual('setting2.DVALUE');
    expect(analyticProperties[7].definitionName).toEqual('input / output parameter name');
    expect(analyticProperties[7].value.getValue()).toEqual('s2.DVALUE');
    expect(analyticProperties[8].definitionName).toEqual('input / output parameter name');
    expect(analyticProperties[8].value.getValue()).toEqual('RUL_PREDICTION.DVALUE');
  });

});





