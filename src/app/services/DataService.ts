import {RowChannelBuilder, RowChannel} from "../classes/Channel";
import {AbstractDataService} from "./AbstractDataService";
import {Injectable} from "@angular/core";
import {List} from "immutable";

@Injectable()
export class DataService extends AbstractDataService {

  addChannel(channelName: string) {
    if (!this.channels.getValue().find((rowChannel: RowChannel) => rowChannel.name.getValue() === channelName)) {
        this.channels.next(this.channels.getValue().push(new RowChannelBuilder().Name(channelName).build()));
    }
  }

  clearChannels() {
    this.channels.next(List<RowChannel>());
  }
}
