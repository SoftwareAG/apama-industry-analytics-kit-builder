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
import {ConfigSerializer} from "./classes/Config";
import {RowSerializer} from "./classes/Row";
import {TransformerSerializer} from "./classes/Transformer";
import {PropertySerializer} from "./classes/Property";
import {FileService} from "./services/FileService";

@NgModule({
  declarations: [
    AppComponent,
    ChannelSelectorComponent,
    TransformerSelectorComponent,
    LadderDiagramComponent,
    TransformerSelectorComponent,
    TransformerPropertySelectorComponent,
    NavBarComponent,
    DragOverlayComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule.forRoot()
  ],
  providers: [
    {provide: AbstractDataService, useClass: DataService},
    {provide: AbstractDragService, useClass: DragService},
    FileService,
    ConfigSerializer,
    RowSerializer,
    TransformerSerializer,
    PropertySerializer
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
