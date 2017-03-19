import {Config} from "./Config";
import {Row} from "./Row";
import {validateSync, ValidationError} from "class-validator";
class AssertionError extends Error {}
describe('Config', () => {

  beforeAll(() => {
    // console.assert doesn't throw an error in the browser so we force it to
    spyOn(console, 'assert').and.callFake((passAssertion) => {
      if (!passAssertion) {
        throw new AssertionError();
      }
    });
  });

  it("should be invalid if the same row is added twice", () => {
    const config = new Config;
    const row = new Row();

    config.rows.push(row);
    expect(validateSync(config)).toEqual([]);
    config.rows.push(row);
    expect(config.rows).toEqual([row, row]);
    expect(validateSync(config)).toContain(jasmine.any(ValidationError));
  });

  it("should allow removing a row that exists", () => {
    const config = new Config;
    const row = new Row();
    config.rows.push(row);

    expect(config.removeRow(row)).toBe(true);
    expect(config.rows).toEqual([]);
    expect(validateSync(config)).toEqual([]);
  });

  it("should allow removing a row that doesn't exist", () => {
    const config = new Config;
    const row = new Row();
    config.rows.push(row);

    expect(config.removeRow(new Row())).toBe(false);
    expect(config.rows).toEqual([row]);
    expect(validateSync(config)).toEqual([]);
  });

  it("should allow moving a row", () => {
    const config = new Config;
    const row = new Row();
    const row2 = new Row();
    config.rows.push(row, row2);

    expect(config.rows).toEqual([row, row2]);
    expect(config.moveRow(0, 1));
    expect(config.rows).toEqual([row2, row]);
    expect(validateSync(config)).toEqual([]);
  });

  it("should allow moving a row from and to the same index", () => {
    const config = new Config;
    const row = new Row();
    config.rows.push(row);

    config.moveRow(0, 0);

    expect(config.rows).toEqual([row]);
    expect(validateSync(config)).toEqual([]);
  });

  it("should prevent moving negative row index", () => {
    const config = new Config;
    const row = new Row();
    config.rows.push(row);

    expect(() => { config.moveRow(-1, 0) }).toThrowError(AssertionError);
    expect(() => { config.moveRow(0, -1) }).toThrowError(AssertionError);
    expect(validateSync(config)).toEqual([]);
  });

  for (let [fromIndex, toIndex] of [[1,1], [0,1], [1,0]]) {
    it(`should throw an error when moving from row index that ${fromIndex?"doesn't":"does"} exist to an index that ${toIndex?"doesn't":"does"} exist`, () => {
      const config = new Config;
      config.rows.push(new Row());
      expect(() => { config.moveRow(fromIndex, toIndex) }).toThrowError(AssertionError);
      expect(validateSync(config)).toEqual([]);
    });
  }

});
