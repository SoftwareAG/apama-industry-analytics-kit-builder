import {Row} from "./Row";
import {ArrayUnique} from "class-validator";

export class Config {

  @ArrayUnique()
  rows : Row[] = [];

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
    console.assert(fromIndex >= 0, "From index must be greater than zero");
    console.assert(toIndex >= 0, "To index must be greater than zero");
    console.assert(fromIndex < this.rows.length, "From index must be less than the size of the array");
    console.assert(toIndex < this.rows.length, "To index must be less than the size of the array");

    this.rows.splice(toIndex, 0, this.rows.splice(fromIndex, 1)[0]);
  }
}
