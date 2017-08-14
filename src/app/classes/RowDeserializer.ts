import {Injectable} from "@angular/core";
import {Transformer} from "./Transformer";
import {Row, RowBuilder} from "./Row";
import {List, Map} from "immutable";
import {IgnoreableDeserializationError} from "./Errors";
import {TransformerDeserializer} from "./TransformerDeserializer";

@Injectable()
export class RowDeserializer {

  constructor(private readonly transformerDeserializer: TransformerDeserializer) {}

  buildRow(configName: string, analyticLines: List<string>): Row {
    const analytics = analyticLines.map((analyticLine:string) => this.transformerDeserializer.buildAnalytic(configName, analyticLine)) as List<{analytic: Transformer, inChannels: Map<number, string>, outChannels: Map<number, string>}>;
    if (analytics.size > 0) {
      const rowBuilder = new RowBuilder()
        .pushTransformer(...analytics.toArray().map(a => a.analytic));
      this.addRowChannels(rowBuilder, analytics);
      return rowBuilder.build().validate();
    } else {
      throw new IgnoreableDeserializationError("Row must have an Analytic in it")
    }
  }

  private addRowChannels(rowBuilder: RowBuilder, rowChannels: List<{analytic: Transformer, inChannels: Map<number, string>, outChannels: Map<number, string>}>) {
    const first = rowChannels.first();
    const last = rowChannels.last();
    first.inChannels.forEach((chanName: string, i: number) => {
      // Only add the channel if it does not have the default name
      if (first.analytic.inputChannels.get(i).name !== chanName) {
        rowBuilder.withInputChannel(i).Name(chanName).endWith();
      }
    });
    last.outChannels.forEach((chanName: string, i: number) => {
      // Only add the channel if it does not have the default name
      if (last.analytic.outputChannels.get(i).name !== chanName) {
        rowBuilder.withOutputChannel(i).Name(chanName).endWith();
      }
    });
  }

}
