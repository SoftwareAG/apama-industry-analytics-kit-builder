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

@NgModule({
  declarations: [
    AppComponent,
    ChannelSelectorComponent,
    TransformerSelectorComponent,
    LadderDiagramComponent,
    TransformerSelectorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    {provide: AbstractDataService, useClass: DataService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
