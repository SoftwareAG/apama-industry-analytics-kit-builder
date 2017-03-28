import {Channel} from "app/classes/Channel";

export abstract class AbstractChannelDataService {

  getChannels: () => Channel[];
  withChannels: (callback: (channels: Channel[]) => void) => void;

}
