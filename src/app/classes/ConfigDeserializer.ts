import {IgnoreableDeserializationError} from "./Errors";
import {Injectable} from "@angular/core";
import {RowDeserializer} from "./RowDeserializer";
import {Config, ConfigBuilder} from "./Config";
import {List} from "immutable";
import * as _ from "lodash";
import {AbstractDataService} from "../services/AbstractDataService";
import {DataService} from "../services/DataService";

@Injectable()
export class ConfigDeserializer {
  readonly commentPattern = /^\s*\\\\/;
  readonly markerCommentPattern =/^\\\\\s*([^:]*)\s*:\s*(.*)\s*$/;
  readonly analyticPattern = /^com.industry.analytics.Analytic/;

  constructor(private readonly rowDeserializer: RowDeserializer, private dataService: AbstractDataService) {}

  fromApama(apama: string) : Config {
    const apamaLines = apama.split("\n");

    const groupedLines = apamaLines
      .filter(apamaLine => apamaLine.trim() !== "")
      .reduce((result, apamaLine) => {

        const commentMatch = apamaLine.match(this.commentPattern);
        const analyticMatch = apamaLine.match(this.analyticPattern);

        if (commentMatch && commentMatch.length) {
          result.commentLines.push(apamaLine);

          const markerCommentMatch = apamaLine.match(this.markerCommentPattern);
          if (markerCommentMatch && markerCommentMatch[1] === 'Row') {
            result.rowAnalyticLines.push([]);
          }

        } else if (analyticMatch && analyticMatch.length) {
          result.rowAnalyticLines[result.rowAnalyticLines.length - 1].push(apamaLine);

        } else {
          console.error(new Error(`Unexpected line: ${apamaLine}`));
        }
        return result;
      }, {
        commentLines: [] as string[],
        rowAnalyticLines: [[]] as string[][]
      });

    const configBuilder = new ConfigBuilder();

    groupedLines.commentLines.forEach((apamaLine) => {
      const match = apamaLine.match(this.markerCommentPattern);
      if (match && match.length) {
        switch(match[1]) {
          case 'Name': {
            configBuilder.Name(match[2]);
            break;
          }
          case 'Description': {
            configBuilder.Description(match[2]);
            break;
          }
          case 'Version' : {
            configBuilder.MetadataVersion(match[2]);
            break;
          }
        }
      }
    });

    (this.dataService as DataService).clearChannels();

    const rows = _.flatMap(groupedLines.rowAnalyticLines, analyticLines => {
      try {
        if (analyticLines.length === 0 ) {
          return [];
        }
        return [this.rowDeserializer.buildRow(List(analyticLines))];
      } catch(e) {
        if (e instanceof IgnoreableDeserializationError) {
          console.error(e);
        } else {
          throw e;
        }
        return [];
      }
    });
    return configBuilder
      .pushRow(...rows)
      .build().validate();
  }

}
