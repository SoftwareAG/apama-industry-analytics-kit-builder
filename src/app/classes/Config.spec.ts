import {Config} from "./Config";
import {Row} from "./Row";
describe('Config', () => {

  describe("Should throw an error if constructed with an invalid object", () => {
    [null, [], ''].forEach((obj) => {
      it(`Construction Object: ${obj}`, () => {
        expect(() => { new Config(obj as any); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if constructed with invalid rows", () => {
    [true, { a: true }, 'hello'].forEach((rows) => {
      it(`Rows: ${rows}`, () => {
        expect(() => { new Config({ rows: rows } as any); }).toThrowError();
      })
    });
  });

  it("should allow removing a row that exists", () => {
    const config = new Config();
    const row = new Row();
    config.rows.push(row);

    expect(config.removeRow(row)).toBe(true);
    expect(config.rows).toEqual([]);
  });

  it("should allow removing a row that doesn't exist", () => {
    const config = new Config();
    const row = new Row();
    config.rows.push(row);

    expect(config.removeRow(new Row())).toBe(false);
    expect(config.rows).toEqual([row]);
  });

  it("should allow moving a row", () => {
    const config = new Config();
    const row = new Row();
    const row2 = new Row();
    config.rows.push(row, row2);

    expect(config.rows).toEqual([row, row2]);
    expect(config.moveRow(0, 1));
    expect(config.rows).toEqual([row2, row]);
  });

  it("should allow moving a row from and to the same index", () => {
    const config = new Config();
    const row = new Row();
    config.rows.push(row);

    config.moveRow(0, 0);

    expect(config.rows).toEqual([row]);
  });

  it("should prevent moving negative row index", () => {
    const config = new Config();
    const row = new Row();
    config.rows.push(row);

    expect(() => { config.moveRow(-1, 0) }).toThrowError();
    expect(() => { config.moveRow(0, -1) }).toThrowError();
  });

  for (let [fromIndex, toIndex] of [[1,1], [0,1], [1,0]]) {
    it(`should throw an error when moving from row index that ${fromIndex?"doesn't":"does"} exist to an index that ${toIndex?"doesn't":"does"} exist`, () => {
      const config = new Config();
      config.rows.push(new Row());
      expect(() => { config.moveRow(fromIndex, toIndex) }).toThrowError();
    });
  }

});
