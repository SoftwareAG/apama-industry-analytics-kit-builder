import {NestedRowBuilder, Row} from "./Row";
import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";

export interface ConfigInterface {
  name: string;
  description: string;
  rows: Row[]
}

export class Config implements ConfigInterface {
  name: string;
  description: string;
  rows : Row[];

  constructor(obj: ConfigInterface) {
    this.name = obj.name;
    this.description = obj.description;
    this.rows = obj.rows;
  }

  /**
   * Removes a row if it is present
   * @param row
   * @returns {boolean} Whether the row was removed
   */
  removeRow(row: Row) : boolean {
    const index = this.rows.indexOf(row);
    if (~index) {
      this.rows.splice(index,1);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Moves a row from and index to an index
   * @param fromIndex
   * @param toIndex
   */
  moveRow(fromIndex: number, toIndex : number) {
    if (fromIndex < 0) { throw new Error("From index must be greater than zero"); }
    if (toIndex < 0) { throw new Error("To index must be greater than zero"); }
    if (fromIndex >= this.rows.length) { throw new Error("From index must be less than the size of the array"); }
    if (toIndex >= this.rows.length) { throw new Error("To index must be less than the size of the array"); }

    this.rows.splice(toIndex, 0, this.rows.splice(fromIndex, 1)[0]);
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
