import {Row, RowInterface} from "./Row";
import {Validator} from "class-validator";
import * as _ from "lodash";

const validator = new Validator();

export interface ConfigInterface {
  rows?: RowInterface[]
}

export class Config {
  rows : Row[];

  constructor(obj: ConfigInterface = {}) {
    if (!_.isPlainObject(obj)) { throw new Error('must have an object to construct from'); }
    const rows = obj.rows || [];
    if (!validator.isArray(rows)) { throw new Error('Unable to parse json object'); }
    this.rows = rows.map((rowObj) => { return new Row(rowObj); });
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
