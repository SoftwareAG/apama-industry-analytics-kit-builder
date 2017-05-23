import {NestedRowBuilder, Row, RowBuilder, RowDeserializer, RowJsonInterface, RowSerializer} from "./Row";
import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {List} from "immutable";
import {AbstractModel} from "./AbstractModel";
import {Injectable} from "@angular/core";
import {Metadata} from "./Metadata";
import {validate} from "validate.js";
import {AbstractMetadataService} from "../services/MetadataService";
import * as _ from "lodash";
import {IgnoreableDeserializationError} from "./Errors";

export interface ConfigJsonInterface {
  name: string;
  description: string;
  metadataVersion: string;
  rows: RowJsonInterface[]
}

interface ModifiableConfigInterface {
  name: string;
  description: string;
  rows: Row[]
}

interface UnmodifiableConfigInterface {
  metadataVersion: string;
}

export interface ConfigInterface extends ModifiableConfigInterface, UnmodifiableConfigInterface {}

export class Config extends AbstractModel<ConfigJsonInterface, never> implements AsObservable, BehaviorSubjectify<ModifiableConfigInterface>, UnmodifiableConfigInterface {
  readonly name: BehaviorSubject<string>;
  readonly description: BehaviorSubject<string>;
  readonly metadataVersion: string;
  readonly rows : BehaviorSubject<List<Row>>;

  constructor(obj: ConfigInterface) {
    super();
    this.name = new BehaviorSubject(obj.name || "");
    this.description = new BehaviorSubject(obj.description || "");
    this.metadataVersion = obj.metadataVersion;
    this.rows = new BehaviorSubject(List(obj.rows));
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.name,
      this.description,
      this.rows,
      this.rows.switchMap(rows => Observable.merge(...rows.toArray().map(row => row.asObservable())))
    ).mapTo(this);
  }

  validate(): this {
    //TODO: do some validation
    if (validate.isEmpty(this.name.getValue())) { throw new Error('Name cannot be empty'); }
    if (validate.isEmpty(this.metadataVersion)) { throw new Error('Version cannot be empty'); }
    return this;
  }

  removeRow(row: Row) {
    this.rows.next(List<Row>(this.rows.getValue().filter(_row => _row !== row)));
  }
}

export class ConfigBuilder extends ClassBuilder<Config> implements ConfigInterface {
  name: string = "";
  description: string = "";
  metadataVersion: string = "0.0.0.0";
  rows: Row[] = [];

  Name(name: string): this {
    this.name = name;
    return this;
  }

  Description(description: string): this {
    this.description = description;
    return this;
  }

  MetadataVersion(metadataVersion: string): this {
    this.metadataVersion = metadataVersion;
    return this;
  }

  Rows(rows: Row[]): this {
    this.rows = rows;
    return this;
  }
  pushRow(...row: Row[]): this {
    this.rows.push(...row);
    return this;
  }
  withRow(): NestedRowBuilder<this> {
    return new NestedRowBuilder((row) => { this.rows.push(row); return this;});
  }

  build(): Config {
    return new Config(this);
  }

  static fromJson(json: ConfigJsonInterface): ConfigBuilder {
    return new ConfigBuilder()
      .Name(json.name)
      .Description(json.description)
      .Rows(json.rows.map((row) => RowBuilder.fromJson(row).build()));
  }
}

export class NestedConfigBuilder<Parent> extends ConfigBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (config: Config) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class ConfigArrayBuilder extends ClassArrayBuilder<Config, NestedConfigBuilder<ConfigArrayBuilder>> {
  constructor() {
    super(NestedConfigBuilder);
  }
}

type RowChannels = {inChannelNames: string[], outChannelNames: string[]};

@Injectable()
export class ConfigSerializer {

  constructor(private rowSerializer: RowSerializer, private metadataService: AbstractMetadataService) {}

  toApama(metadata: Metadata, config: Config) {
    return "" +
      (config.name.getValue()  ? `\\\\ Name: ${config.name.getValue()}\n` : '') +
      (config.description.getValue()  ? `\\\\ Description: ${config.description.getValue()}\n` : '') +
      `\\\\ Version: ${config.metadataVersion}\n` +
      config.rows.getValue().map((row: Row, i: number) => this.rowSerializer.toApama(metadata, row, i)).join('\n\n');
  }
}

@Injectable()
export class ConfigDeserializer {
  readonly commentPattern = /^\s*\\\\/;
  readonly markerCommentPattern =/^\\\\\s*([^:]*)\s*:\s*(.*)\s*$/;
  readonly analyticPattern = /^com.industry.analytics.Analytic/;

  constructor(private readonly rowDeserializer: RowDeserializer) {}

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

    const rows = _.flatMap(groupedLines.rowAnalyticLines, analyticLines => {
      try {
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
