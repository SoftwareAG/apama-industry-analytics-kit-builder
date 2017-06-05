import {RowChannelBuilder, RowChannel} from "../classes/Channel";
import {AbstractDataService} from "./AbstractDataService";
import {Injectable} from "@angular/core";

@Injectable()
export class DataService extends AbstractDataService {

  loadChannel(channelName: string) {
    if (!this.channels.getValue().find((rowChannel: RowChannel) => rowChannel.name.getValue() === channelName)) {
        this.channels.next(this.channels.getValue().push(new RowChannelBuilder().Name(channelName).build()));
    }
  }
}
