
import {FileService} from "./FileService";
import {TestBed} from "@angular/core/testing";
import {Config, ConfigSerializer} from "../classes/Config";
import {TransformerSerializer} from "app/classes/Transformer";
import {RowSerializer} from "../classes/Row";
import {PropertySerializer} from "../classes/Property";
import {AbstractMetadataService, MetadataService} from "./MetadataService";


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
        {provide: AbstractMetadataService, useClass: MetadataService}
      ]
    });
    fileService = TestBed.get(FileService) as FileService;
    metadataService = TestBed.get(AbstractMetadataService) as MetadataService;

    metadataService.loadMetadata({
      version: "0.0.0.0",
      groupOrder: [],
      analytics: [{
        description: "Suppress events after a triggering event.",
        group: "Flow Manipulation",
        name: "Suppressor",
        outputChannels: [
          {
            description: "Suppressed data channel",
            name: "Suppressed Data"
          }],
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
        ]
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
        }]
    });
  });

  it('should error if no EPL is provided', () => {
    expect( () => { fileService.deserialize(""); }).toThrowError();
  });

  it('should error if no name has been provided in the .evt file', () => {
    const apama = `\\\\ Description: Sample configuration description
\\\\ Version: 0.0.0.0`;
    expect( () => { fileService.deserialize(apama); }).toThrowError();
  });

  it('should error if empty Name is provided in the .evt file', () => {
    const apama = `\\\\ Name:  
\\\\ Description: No Name data provided
\\\\ Version: 0.0.0.0`;
    expect( () => { fileService.deserialize(apama); }).toThrowError();
  });

  it('should error if no rows exist in the .evt file', () => {
    const apama = `\\\\ Name: No Rows 
\\\\ Description: Sample configuration description
\\\\ Version: 0.0.0.0`;
    expect( () => { fileService.deserialize(apama); }).toThrowError();
  });

  it('should parse correctly if provided with a row with no analytics', () => {
    const apama = `\\\\ Name: One row with no analytics
\\\\ Description: Sample configuration description
\\\\ Version: 0.0.0.0
\\\\ Row: 0`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(0);
  });

  it('should parse correctly if no Description is provided', () => {
    const apama = `\\\\ Name: No Description provided
\\\\ Version: 0.0.0.0
\\\\ Row: 0`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(0);
  });

  it('should parse correctly if provided with a row with analytics', () => {
    const apama = `\\\\ Name: Single row with three analytics
\\\\ Description: This configuration demonstrates a single rows containing three analytics
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
  });

  it('should parse correctly if provided with a row with duplicate analytics', () => {
    const apama = `\\\\ Name: Three rows with duplicate Analytics
\\\\ Description: This configuration demonstrates a single row with duplicate analytics
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
  });

  it('should parse correctly if provided with 2 rows each with three analytics', () => {
    const apama = `\\\\ Name: Two rows with multiple analytics
\\\\ Description: This configuration demonstrates multiple rows containing analytics
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})

\\\\ Row: 1
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(2);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
    expect(config.rows.getValue().last().transformers.getValue().size).toEqual(3);
  });

  it('should ignore Rows which do not contain any analytics', () => {
    const apama = `\\\\ Name: Ignore Rows which do not contain any analytics
\\\\ Description: Ignore Rows which do not contain any analytics
\\\\ Version: 0.0.0.0
\\\\ Row: 0

\\\\ Row: 1
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
  });

  it('should parse correctly if provided with out of sequence row numbers', () => {
    const apama = `\\\\ Name: Two out of sequence rows
\\\\ Description: Two out of sequence rows
\\\\ Version: 0.0.0.0
\\\\ Row: 2
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})

\\\\ Row: 1
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(2);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
    expect(config.rows.getValue().last().transformers.getValue().size).toEqual(3);
  });

  it('should parse correctly if provided with duplicate row numbers each with three analytics', () => {
    const apama = `\\\\ Name: Duplicate row numbers with three analytics
\\\\ Description: Duplicate row numbers with three analytics
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})

\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(2);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(3);
    expect(config.rows.getValue().last().transformers.getValue().size).toEqual(3);
  });

  it('should ignore commented out lines in the .evt file', () => {
    const apama = `\\\\ Name: Three rows with complex Analytic and channel configurations
\\\\ Description: Three rows with commented out lines
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
// com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
// com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})

\\\\ Row: 1
//com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})

//\\\\ Row: 2
// com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
//com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
//com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(2);
    expect(config.rows.getValue().first().transformers.getValue().size).toEqual(1);
    expect(config.rows.getValue().last().transformers.getValue().size).toEqual(2);
  });

  it('should error if an "Analytic line" is read before a "Row" line in the .evt file', () => {
    const apama = `\\\\ Name: Analytic before a Row
\\\\ Description: Analytic before a Row
\\\\ Version: 0.0.0.0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})
// com.industry.analytics.Analytic("Sorter",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})
// com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow":"10.0d"})`;
  expect( () => { fileService.deserialize(apama); }).toThrowError('Analytic cannot be processed outside of a Row');
  });

  it('should error if an invalid Analytic name is provided', () => {
    const apama = `\\\\ Name: Invalid Analytic
\\\\ Description: Invalid Analytic
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("InvalidAnalyticName",["Input Channel 1"],["Row0:Channel1"],{"timeInterval":"10.0d"})`;
  expect( () => { fileService.deserialize(apama); }).toThrowError("Analytic 'InvalidAnalyticName' not found in definitions");
  });

  it('should error if an Analytic is provided with an incorrect property name', () => {
    const apama = `\\\\ Name: Invalid Analytic
\\\\ Description: Invalid Analytic
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"invalidPropertyName":"10.0d"})`;
  expect( () => { fileService.deserialize(apama); }).toThrowError("Analytic 'Slicer' does not contain property 'invalidPropertyName'");
  });

  it('should error if an Analytic is provided with an invalid property', () => {
    const apama = `\\\\ Name: Invalid Analytic
\\\\ Description: Invalid Analytic
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Slicer",["Input Channel 1"],["Row0:Channel1"],{"invalidPropertyName"})`;
  expect( () => { fileService.deserialize(apama); }).toThrowError('Properties in Slicer is not valid : {"invalidPropertyName"}');
  });

  it('should error if an Analytic is provided with an incorrect property string value for the decimal property type', () => {
    const apama = `\\\\ Name: Invalid Analytic
\\\\ Description: Invalid Analytic
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"timeWindow": "ABC"})`;
  expect( () => { fileService.deserialize(apama); }).toThrowError(`Property value "ABC" cannot be converted to the required property decimal type`);
  });

  it('should error if an Analytic is provided with an incorrect property value for the property type', () => {
    const apama = `\\\\ Name: Invalid Analytic
\\\\ Description: Invalid Analytic
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Suppressor",["Input Channel 1"],["Row0:Channel1"],{"testBoolean": "ABC"})`;
  expect( () => { fileService.deserialize(apama); }).toThrowError('Unable to parse "ABC" to boolean');
  });

  it('should pass even where no properties exist for an Analytic', () => {
    const apama = `\\\\ Name: New one
\\\\ Description: new one description
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Combiner",["Row0:Input0"],["Row0:Channel1"],{})`;
    const config: Config = fileService.deserialize(apama);
    expect( config.rows.getValue().first().transformers.getValue().first().name).toEqual('Combiner');
    expect(config.rows.getValue().last().transformers.getValue().first().propertyValues.size).toEqual(0);
  });

  it('should parse multiple properties in an Analytic', () => {
    const apama = `\\\\ Name: my config
\\\\ Description: with a description
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Corridor",["Row0:Channel1"],["Row0"],{"upperThreshold":"20.0d","lowerThreshold":"10.0d","zone":"outside","duration":"5.0d"})`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(1);
    expect( config.rows.getValue().first().transformers.getValue().size).toEqual(1);
    expect(config.rows.getValue().last().transformers.getValue().first().propertyValues.size).toEqual(4);
    expect(config.rows.getValue().last().transformers.getValue().first().getPropertyValues("upperThreshold").get(0).value.getValue()).toEqual(20);
    expect(config.rows.getValue().last().transformers.getValue().first().getPropertyValues("lowerThreshold").get(0).value.getValue()).toEqual(10);
    expect(config.rows.getValue().last().transformers.getValue().first().getPropertyValues("zone").get(0).value.getValue()).toEqual("outside");
    expect(config.rows.getValue().last().transformers.getValue().first().getPropertyValues("duration").get(0).value.getValue()).toEqual(5.0);
  });

  it('should create the row input and output channels based on the Analytics on the row', () => {
    const apama = `\\\\ Name: Peer Analysis
\\\\ Version: 0.0.0.0
\\\\ Row: 0
com.industry.analytics.Analytic("Average",["Orders"],["Moving Average"],{"timeWindow":"0.0d"})

\\\\ Row: 1
com.industry.analytics.Analytic("Spread",["Moving Average", "Orders"],["Row1:Channel1"],{"anomaliesOnly":"false","spreadThreshold":"0.0d"})
com.industry.analytics.Analytic("Threshold",["Row1:Channel1","Row1:Channel1"],["Outliers"],{"threshold":"100.0d","direction":"crossing","duration":"10.0d"})`;
    const config: Config = fileService.deserialize(apama);
    expect(config.rows.getValue().size).toEqual(2);
    expect( config.rows.getValue().first().transformers.getValue().size).toEqual(1);
    expect( config.rows.getValue().first().inputChannelOverrides.getValue().get(0).name.getValue()).toEqual('Orders');
    expect( config.rows.getValue().first().outputChannelOverrides.getValue().get(0).name.getValue()).toEqual('Moving Average');
    expect( config.rows.getValue().last().transformers.getValue().size).toEqual(2);
    expect( config.rows.getValue().last().inputChannelOverrides.getValue().get(0).name.getValue()).toEqual('Moving Average');
    expect( config.rows.getValue().last().inputChannelOverrides.getValue().get(1).name.getValue()).toEqual('Orders');
    expect( config.rows.getValue().last().outputChannelOverrides.getValue().get(0).name.getValue()).toEqual('Outliers');
  });

});





