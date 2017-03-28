
import {Injectable} from "@angular/core";
import {AbstractChannelDataService} from "./AbstractChannelDataService";
import {Channel} from "../classes/Channel";

@Injectable()
export class AsyncChannelDataServiceMock implements AbstractChannelDataService {

  //noinspection JSMethodCanBeStatic
  getChannels() {

    return [
      new Channel({name: 'Default'}),
      new Channel({name: 'Channel 1'}),
      new Channel({name: 'Channel 2'}),
      new Channel({name: 'Channel 3'}),
      new Channel({name: 'Channel 4'})
    ]
  };

  withChannels(callback: (channels : Channel[]) => void ) {
    // send immediate channel data
    setTimeout(() => { callback(this.getChannels()); });
    // send channels update every 10 seconds
    setInterval(() => { callback(this.getChannels()); }, 10000);

  }
}
