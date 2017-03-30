import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ChannelSelectorComponent } from './widgets/channel-selector/channel-selector.component';
import { AbstractMetadataService } from "./services/AbstractMetadataService";
import { TransformerSelectorComponent } from "./widgets/transformer-selector/transformer-selector.component";
import { AsyncMetadataServiceMock } from "app/services/AsyncMetadataServiceMock";
import { AbstractChannelDataService } from "./services/AbstractChannelDataService";
import { AsyncChannelDataServiceMock } from "./services/AsyncChannelMetadataServiceMock";
import { AbstractTransformerPropertyService } from "./services/AbstractTransformerPropertyService";
import { AsyncTransformerPropertyServiceMock } from "./services/AsyncTransformerPropertyServiceMock";
import { TransformerPropertySelectorComponent } from "./widgets/transformer-property-selector/transformer-property-selector.component";

@NgModule({
  declarations: [
    AppComponent,
    ChannelSelectorComponent,
    TransformerSelectorComponent,
    TransformerPropertySelectorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    {provide: AbstractMetadataService, useClass: AsyncMetadataServiceMock},
    {provide: AbstractChannelDataService, useClass: AsyncChannelDataServiceMock},
    {provide: AbstractTransformerPropertyService, useClass: AsyncTransformerPropertyServiceMock}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
