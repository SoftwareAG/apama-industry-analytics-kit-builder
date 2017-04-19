import {NestedRowBuilder, Row, RowBuilder, RowJsonInterface, RowSerializer} from "./Row";
import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {List} from "immutable";
import {AbstractModel} from "./AbstractModel";
import {Inject, Injectable} from "@angular/core";

export interface ConfigJsonInterface {
  name: string;
  description: string;
  rows: RowJsonInterface[]
}

export interface ConfigInterface {
  name: string;
  description: string;
  rows: Row[]
}

export class Config extends AbstractModel<ConfigJsonInterface> implements AsObservable, BehaviorSubjectify<ConfigInterface>  {
  readonly name: BehaviorSubject<string>;
  readonly description: BehaviorSubject<string>;
  readonly rows : BehaviorSubject<List<Row>>;

  constructor(obj: ConfigInterface) {
    super();
    this.name = new BehaviorSubject(obj.name);
    this.description = new BehaviorSubject(obj.description);
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
}

export class ConfigBuilder extends ClassBuilder<Config> implements ConfigInterface {
  name: string;
  description: string;
  rows: Row[] = [];

  Name(name: string): this {
    this.name = name;
    return this;
  }

  Description(description: string): this {
    this.description = description;
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

@Injectable()
export class ConfigSerializer {

  constructor(private rowSerializer: RowSerializer) {}

  toApama(config: ConfigJsonInterface) {

    return "" +
      (config.name  ? `\\\\ Name: ${config.name}\n` : '') +
      (config.description  ? `\\\\ Description: ${config.description}\n` : '') +
      config.rows.map((row, i) => this.rowSerializer.toApama(row, i)).join('\n\n');
  }
}
