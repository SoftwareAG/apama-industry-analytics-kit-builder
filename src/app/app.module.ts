import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {AppComponent} from "./app.component";
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
import {ConfigSerializer} from "./classes/Config";
import {RowSerializer} from "./classes/Row";
import {TransformerSerializer} from "./classes/Transformer";
import {PropertyDeserializer, PropertySerializer} from "./classes/Property";
import {FileService} from "./services/FileService";
import {AbstractMetadataService, MetadataService} from "./services/MetadataService";
import {SaveConfigurationComponent} from "./widgets/save-configuration/save-configuration.component";
import {FocusDirective} from "./directives/focus.directive";
import {InformationComponent} from "./widgets/information/information.component";
import {TransformerDefinitionComponent} from "./widgets/transformer-definition/transformer-definition.component";
import {ResizableModule} from "angular-resizable-element";
import {TransformerChannelDeserializer} from "./classes/TransformerChannel";
import {RowDeserializer} from "./classes/RowDeserializer";
import {ConfigDeserializer} from "./classes/ConfigDeserializer";
import {LoginDialogComponent} from "./widgets/login-dialog/login-dialog.component";
import {NewConfigurationDialogComponent} from "./widgets/new-configuration-dialog/new-configuration-dialog.component";
import {TransformerDeserializer} from "./classes/TransformerDeserializer";
import {PropertySelectorComponent} from "./widgets/property-selector/property-selector.component";
import {ChannelPropertySelectorComponent} from "./widgets/channel-property-selector/channel-property-selector.component";
import {SelectionService} from "./services/SelectionService";
import {HumanReadablePipe} from "./pipes/HumanReadablePipe.pipe";
import {SandboxEvalComponent} from "./widgets/sandbox-eval/sandbox-eval.component";
import {SandboxEvalService} from "./services/SandboxEvalService";
import {HistoryService} from "./services/HistoryService";
import { HistoryComponent } from './widgets/history/history.component';

@NgModule({
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
    LoginDialogComponent,
    NewConfigurationDialogComponent,
    PropertySelectorComponent,
    ChannelPropertySelectorComponent,
    HumanReadablePipe,
    SandboxEvalComponent,
    HistoryComponent
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
    HistoryService,
    SelectionService,
    FileService,
    ConfigSerializer,
    RowSerializer,
    TransformerSerializer,
    PropertySerializer,
    ConfigDeserializer,
    RowDeserializer,
    TransformerDeserializer,
    TransformerChannelDeserializer,
    PropertyDeserializer,
    SandboxEvalService
  ],
  entryComponents: [
    SaveConfigurationComponent,
    LoginDialogComponent,
    NewConfigurationDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
