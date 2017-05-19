import {ConfigBuilder} from "../classes/Config";
import {RowChannelBuilder} from "../classes/Channel";
import {AbstractDataService} from "./AbstractDataService";
import {Injectable} from "@angular/core";

@Injectable()
export class DataService extends AbstractDataService {

  loadChannels()
  {
    this.channels.next(this.channels.getValue().push(
      new RowChannelBuilder()
        .Name("Orders")
        .build()
    ));

    this.channels.next(this.channels.getValue().push(
      new RowChannelBuilder()
        .Name("Moving Average")
        .build()
    ));

    this.channels.next(this.channels.getValue().push(
      new RowChannelBuilder()
        .Name("Outliers")
        .build()
    ));
  }
}
