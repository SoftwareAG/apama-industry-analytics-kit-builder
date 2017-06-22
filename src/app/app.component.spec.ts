import {async, TestBed} from "@angular/core/testing";

import {AppComponent} from "./app.component";
import {TransformerSelectorComponent} from "./widgets/transformer-selector/transformer-selector.component";
import {TransformerPropertySelectorComponent} from "./widgets/transformer-property-selector/transformer-property-selector.component";
import {LadderDiagramComponent} from "./widgets/ladder-diagram/ladder-diagram.component";
import {AbstractDataService} from "./services/AbstractDataService";
import {DataService} from "./services/DataService";
import {NavBarComponent} from "./widgets/nav-bar/nav-bar.component";
import {AbstractDragService} from "./services/AbstractDragService";
import {DragService} from "./services/DragService";
import {DragOverlayComponent} from "./widgets/dragoverlay/drag-overlay.component";
import {FormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {ConfigSerializer} from "./classes/Config";
import {RowSerializer} from "./classes/Row";
import {PropertyDeserializer, PropertySerializer} from "app/classes/Property";
import {TransformerSerializer} from "./classes/Transformer";
import {FileService} from "./services/FileService";
import {AbstractMetadataService, MetadataService} from "./services/MetadataService";
import {SaveConfigurationComponent} from "./widgets/save-configuration/save-configuration.component";
import {ResizableModule} from "angular-resizable-element";
import {BrowserModule} from "@angular/platform-browser";
import {InformationComponent} from "./widgets/information/information.component";
import {TransformerDefinitionComponent} from "./widgets/transformer-definition/transformer-definition.component";
import {FocusDirective} from "./directives/focus.directive";
import {TransformerChannelDeserializer} from "./classes/TransformerChannel";
import {RowChannelComponent} from "./widgets/row-channel/row-channel.component";
import {ConfigDeserializer} from "./classes/ConfigDeserializer";
import {RowDeserializer} from "./classes/RowDeserializer";
import {HttpModule} from "@angular/http";
import {TransformerDeserializer} from "./classes/TransformerDeserializer";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        TransformerSelectorComponent,
        LadderDiagramComponent,
        TransformerSelectorComponent,
        TransformerPropertySelectorComponent,
        NavBarComponent,
        DragOverlayComponent,
        SaveConfigurationComponent,
        FocusDirective,
        InformationComponent,
        TransformerDefinitionComponent,
        RowChannelComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ResizableModule,
        NgbModule.forRoot()
      ],
      providers: [
        {provide: AbstractDataService, useClass: DataService},
        {provide: AbstractDragService, useClass: DragService},
        {provide: AbstractMetadataService, useClass: MetadataService},
        ConfigSerializer,
        RowSerializer,
        TransformerSerializer,
        PropertySerializer,
        FileService,
        ConfigSerializer,
        RowSerializer,
        TransformerSerializer,
        PropertySerializer,
        ConfigDeserializer,
        RowDeserializer,
        TransformerDeserializer,
        TransformerChannelDeserializer,
        PropertyDeserializer
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

});
