
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

});





