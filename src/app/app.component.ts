import { Component } from '@angular/core';
import {AbstractDataService} from "./services/AbstractDataService";
import {DataService} from "./services/DataService";
import {AbstractMetadataService} from "./services/MetadataService";
import {MetadataBuilder} from "./classes/Metadata";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Analytics Builder';

  constructor(dataService: AbstractDataService, metadataService: AbstractMetadataService) {
    (dataService as DataService).loadConfigurations();
    (dataService as DataService).loadChannels();

    metadataService.metadata.next(new MetadataBuilder()
      .Version("1.0.0")
      .withTransformer()
        .Name("Sorter")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("NoInput")
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("NoOutput")
        .withInputChannel().Name("In1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("Drift")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("Spike")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("Threshold")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("Delta")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("Gradient")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("Average")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("Sum")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("Mode")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withTransformer()
        .Name("Spread")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith().build()
    )
  }
}
