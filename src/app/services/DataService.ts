import {RowChannel, RowChannelBuilder} from "../classes/Channel";
import {AbstractDataService} from "./AbstractDataService";
import {Injectable} from "@angular/core";
import {List} from "immutable";
import {Transformer} from "../classes/Transformer";
import {TransformerChannel} from "../classes/TransformerChannel";
import {Row} from "../classes/Row";

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

  addAnalyticChannelsToChannelsPanel(transformer: Transformer) {
    transformer.inputChannels.map( (transformerChannel: TransformerChannel) => {
      this.addChannel(transformerChannel.name);
    });

    transformer.outputChannels.map( (transformerChannel: TransformerChannel) => {
      this.addChannel(transformerChannel.name);
    });
  }

  removeAnalyticChannelsFromChannelsPanel(transformer: Transformer) {
    transformer.inputChannels
      .concat(transformer.outputChannels)
      .map( (transformerChannel: TransformerChannel) => {

        // Get the total count of analytics in all rows which use the transformerChannel.name
        const totalCount = this.hierarchy.getValue().rows.getValue().reduce( (totalCount:number, row:Row) => {

          return row.transformers.getValue().reduce( (totalCount: number, transformer: Transformer) => {

            const totalInputChannelCount = transformer.inputChannels.reduce( (totalCount: number, transformerInputChannel:TransformerChannel) => {
                                              if (transformerInputChannel.name === transformerChannel.name) {
                                                return totalCount+1;
                                              }
                                           },totalCount);
            const totalOutputChannelCount = transformer.outputChannels.reduce( (totalCount: number, transformerOutputChannel:TransformerChannel) => {
                                              if (transformerOutputChannel.name === transformerChannel.name) {
                                                return totalCount + 1;
                                              }
                                           },totalCount);
            if (totalInputChannelCount) {
              totalCount += totalInputChannelCount;
            }

            if (totalOutputChannelCount) {
              totalCount += totalOutputChannelCount;
            }
            return totalCount;
          }, totalCount);
        }, 0);

        if (totalCount === 0) {
            const newChannels: List<RowChannel> = this.channels.getValue()
              .filter( (rowChannel: RowChannel) => {
                return rowChannel.name.getValue() !== transformerChannel.name;
              }).toList();
            this.channels.next(newChannels);
        }
    });
  }
}
