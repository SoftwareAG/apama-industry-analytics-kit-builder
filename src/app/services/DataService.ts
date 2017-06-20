import {RowChannel, RowChannelBuilder} from "../classes/Channel";
import {AbstractDataService} from "./AbstractDataService";
import {Injectable} from "@angular/core";
import {List} from "immutable";
import {Transformer} from "../classes/Transformer";
import {TransformerChannel} from "../classes/TransformerChannel";
import {Row} from "../classes/Row";
import {Data} from "@angular/router";

@Injectable()
export class DataService extends AbstractDataService {

  modified: boolean = false;

  constructor() {
    super();
    this.hierarchy.switchMap(hierarchy => hierarchy.asObservable()).subscribe(() => {
      this.setModified(true);
    });

    this.hierarchy.subscribe( () => {
      setTimeout( () => {
        this.setModified(false);
      });
    })
  }

  setModified(modifiedValue: boolean) {
    this.modified = modifiedValue;
  }

  isModified(): boolean {
    return this.modified === true;
  }

  addChannel(channelName: string) {
    if (!this.channels.getValue().find((rowChannel: RowChannel) => rowChannel.name.getValue() === channelName)) {
        this.channels.next(this.channels.getValue().push(new RowChannelBuilder().Name(channelName).build()));
    }
  }

  clearChannels() {
    this.channels.next(List<RowChannel>());
  }

  addAnalyticChannelsToChannelsPanel(transformer: Transformer) {
    transformer.inputChannels.map( (transformerChannel: TransformerChannel) => {
      this.addChannel(transformerChannel.name);
    });

    transformer.outputChannels.map( (transformerChannel: TransformerChannel) => {
      this.addChannel(transformerChannel.name);
    });
  }

  removeAnalyticChannelsFromChannelsPanel(transformer: Transformer) {
    const allChannels = List<string>(this.hierarchy.getValue().rows.getValue().reduce( (arr: List<string>, row: Row) => {
      if (row.transformers.getValue().size) {
        const inputChannels = row.transformers.getValue().get(0).inputChannels.map( (transformerChannel: TransformerChannel) => transformerChannel.name);
        const outputChannels = row.transformers.getValue().get(row.transformers.getValue().size - 1).outputChannels.map((transformerChannel: TransformerChannel) => transformerChannel.name);
        return arr.concat(inputChannels).concat(outputChannels);
      }
      return arr;
    }, List<string>()));

    const newChannels = this.channels.getValue()
       .filter( (rowChannel: RowChannel) => {
          return allChannels.findIndex((channelName:string) => rowChannel.name.getValue() === channelName) != -1;
       }).toList();
    this.channels.next(newChannels);
  }
}
