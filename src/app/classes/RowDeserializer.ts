import {Injectable} from "@angular/core";
import {Transformer, TransformerDeserializer} from "./Transformer";
import {AbstractDataService} from "../services/AbstractDataService";
import {Row, RowBuilder} from "./Row";
import {List, Map} from "immutable";
import {IgnoreableDeserializationError} from "./Errors";
import {RowChannel, RowChannelBuilder} from "./Channel";
import {DataService} from "../services/DataService";

@Injectable()
export class RowDeserializer {

  constructor(private readonly transformerDeserializer: TransformerDeserializer, private dataService: AbstractDataService) {}

  buildRow(analyticLines: List<string>): Row {
    const analytics = analyticLines.map((analyticLine:string) => this.transformerDeserializer.buildAnalytic(analyticLine)) as List<{analytic: Transformer, inChannels: Map<number, string>, outChannels: Map<number, string>}>;
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
    rowChannels.first().inChannels.forEach((chanName: string, i: number) => {
      rowBuilder.withInputChannel(i).Name(chanName).endWith();
      (this.dataService as DataService).loadChannel(chanName);
    });
    rowChannels.last().outChannels.forEach((chanName: string, i: number) => {
      rowBuilder.withOutputChannel(i).Name(chanName).endWith();
      (this.dataService as DataService).loadChannel(chanName);
    });
  }

}
