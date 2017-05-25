import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";

import {AppComponent} from "./app.component";
import {ChannelSelectorComponent} from "./widgets/channel-selector/channel-selector.component";
import {TransformerSelectorComponent} from "./widgets/transformer-selector/transformer-selector.component";
import {LadderDiagramComponent} from "./widgets/ladder-diagram/ladder-diagram.component";
import {AbstractDataService} from "./services/AbstractDataService";
import {DataService} from "app/services/DataService";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {TransformerPropertySelectorComponent} from "./widgets/transformer-property-selector/transformer-property-selector.component";
import {NavBarComponent} from "./widgets/nav-bar/nav-bar.component";
import {AbstractDragService} from "app/services/AbstractDragService";
import {DragService} from "./services/DragService";
import {DragOverlayComponent} from "./widgets/dragoverlay/drag-overlay.component";
import {ConfigDeserializer, ConfigSerializer} from "./classes/Config";
import {RowDeserializer, RowSerializer} from "./classes/Row";
import {TransformerDeserializer, TransformerSerializer} from "./classes/Transformer";
import {PropertyDeserializer, PropertySerializer} from "./classes/Property";
import {FileService} from "./services/FileService";
import {AbstractMetadataService, MetadataService} from "./services/MetadataService";
import {SaveConfigurationComponent} from "./widgets/save-configuration/save-configuration.component";
import {FocusDirective} from "./directives/focus.directive";
import {InformationComponent} from "./widgets/information/information.component";
import {TransformerDefinitionComponent} from "./widgets/transformer-definition/transformer-definition.component";
import {ResizableModule} from "angular-resizable-element";
import {TransformerChannelDeserializer} from "./classes/TransformerChannel";
import {RowChannelComponent} from "./widgets/row-channel/row-channel.component";

@NgModule({
  declarations: [
    AppComponent,
    ChannelSelectorComponent,
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
  entryComponents: [
    SaveConfigurationComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
