import {ComponentFixture, TestBed} from "@angular/core/testing";
import {RowDeserializer} from "./RowDeserializer";
import {List} from "immutable";
import {AbstractMetadataService, MetadataService} from "../services/MetadataService";
import {PropertyDeserializer} from "./Property";
import {TransformerChannelDeserializer} from "./TransformerChannel";
import {AbstractDataService} from "../services/AbstractDataService";
import {DataService} from "../services/DataService";
import {ChannelSelectorComponent} from "../widgets/channel-selector/channel-selector.component";
import {RowChannelComponent} from "../widgets/row-channel/row-channel.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {Injectable} from "@angular/core";
import {AbstractDragService, Draggable, Dragged, Point} from "app/services/AbstractDragService";
import {Row} from "./Row";
import * as _ from "lodash";
import {RowChannel} from "./Channel";
import {TransformerDeserializer} from "./TransformerDeserializer";
import {TransformerChannelDef} from "./TransformerChannelDef";

@Injectable()
class DragServiceMock extends AbstractDragService {
  startDrag(draggable: Draggable) {}
  stopDrag(): Dragged | undefined { return undefined; }
  drag(newLocation: Point) {}
}

describe('RowDeserializer', () => {

  let component: ChannelSelectorComponent;
  let fixture: ComponentFixture<ChannelSelectorComponent>;
  let el: HTMLElement;

  let rowDeserializer: RowDeserializer;
  let metadataService: AbstractMetadataService;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [
        ChannelSelectorComponent,
        RowChannelComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        NgbModule.forRoot()
      ],
      providers: [
        {provide: AbstractDragService, useClass: DragServiceMock},
        {provide: AbstractDataService, useClass: DataService},
        {provide: AbstractMetadataService, useClass: MetadataService},
        RowDeserializer,
        TransformerDeserializer,
        PropertyDeserializer,
        TransformerChannelDeserializer
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    rowDeserializer = TestBed.get(RowDeserializer) as RowDeserializer;
    metadataService = TestBed.get(AbstractMetadataService) as MetadataService;

    fixture = TestBed.createComponent(ChannelSelectorComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement.nativeElement;

    metadataService.loadMetadata({
      version: "2.0.0.0",
      groupOrder: [],
      analytics: [{
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
          },{
            "description": "Defines the lower threshold value that is used to detect breaches",
            "name": "lowerThreshold",
            "type": "decimal"
          },{
            "description": "Defines whether to check for data inside or outside the corridor",
            "name": "zone",
            "type": "string",
            "validValues": [
              "inside",
              "outside"
            ]
          },{
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
        }]
    });
  });

  it('should add any new overridden input and output channels from the Row to the Channel Selector Component', () => {
    const analyticLines: string[] = [];
    analyticLines.push('com.industry.analytics.Analytic("Corridor",["ABC"],["DEF"],{})');
    const row:Row = rowDeserializer.buildRow(List(analyticLines));
    fixture.detectChanges();

    const rowChannels = Array.from(el.querySelectorAll('row-channel'));
    expect(rowChannels).toBeArrayOfSize(4);

    const metaDataChannels = metadataService.getAnalytic('Corridor').inputChannelsByName.concat(metadataService.getAnalytic('Corridor').outputChannelsByName).toArray();
    expect(metaDataChannels.length).toEqual(2);

    // combine the input and output rows so we can check
    const combinedRowChannels = row.inputChannelOverrides.getValue().toArray().concat(row.outputChannelOverrides.getValue().toArray());
    expect(combinedRowChannels.length).toEqual(2);

    const allChannels = metaDataChannels
      .map( (metaDataChannel:TransformerChannelDef) => {
        return metaDataChannel.name;
      })
      .concat(combinedRowChannels
        .map( (rowChannel:RowChannel) => {
          return rowChannel.name.getValue()
        })
    );

    // Check Channels
    rowChannels.forEach((channelEl:HTMLElement) => {
      const htmlElementChannelName = (channelEl.querySelector('text') as Element).textContent;
      expect(allChannels.find( channelName => {
        return channelName === htmlElementChannelName;
      })).toEqual(htmlElementChannelName);
    });
  });

  it('should ignore any duplicate input and output channels from the Row to the Channel Selector Component', () => {
    const analyticLines: string[] = [];
    analyticLines.push('com.industry.analytics.Analytic("Combiner",["AAA", "BBB", "AAA"],["OUT"],{})');
    const row:Row = rowDeserializer.buildRow(List(analyticLines));
    fixture.detectChanges();

    // AAA, BBB, AAA - Input Override channels in the analytic
    expect(row.inputChannelOverrides.getValue().toArray()).toBeArrayOfSize(3);

    // OUT - Output Override channels in the analytic
    expect(row.outputChannelOverrides.getValue().toArray()).toBeArrayOfSize(1);

    const rowChannels = Array.from(el.querySelectorAll('row-channel'));

    // AAA, BBB, OUT - Channel Names shown in the Channel Selector Component
    expect(rowChannels).toBeArrayOfSize(5);

    const metaDataChannels = metadataService.getAnalytic('Combiner').inputChannelsByName.concat(metadataService.getAnalytic('Combiner').outputChannelsByName).toArray();
    expect(metaDataChannels.length).toEqual(2);

    // combine the input and output rows so we can check
    const combinedRowChannels = row.inputChannelOverrides.getValue().toArray().concat(row.outputChannelOverrides.getValue().toArray());
    expect(combinedRowChannels.length).toEqual(4);

    const allChannels = metaDataChannels
      .map((metaDataChannel: TransformerChannelDef) => metaDataChannel.name)
      .concat(combinedRowChannels
        .map((rowChannel: RowChannel) => rowChannel.name.getValue())
      );

    // Check Channels
    rowChannels.forEach((channelEl: HTMLElement) => {
      const htmlElementChannelName = (channelEl.querySelector('text') as Element).textContent;
      expect(allChannels.find(channelName => channelName === htmlElementChannelName)).toEqual(htmlElementChannelName);
    });

  })
});
