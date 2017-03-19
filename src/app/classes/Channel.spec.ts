import {Channel} from "./Channel";
import {validateSync, ValidationError} from "class-validator";
describe('Channel', () => {
  it("should be valid if using a correct name", () => {
    const chan = new Channel('Test Channel');
    expect(validateSync(chan)).toEqual([]);
  });

  describe("Be invalid if using an incorrect name", () => {
    [null, undefined, [], {}, ''].forEach((name) => {
      it(`Name: ${name}`, () => {
        const chan = new Channel(name as any);
        expect(validateSync(chan)).toContain(jasmine.any(ValidationError));
      })
    });
  });
});
