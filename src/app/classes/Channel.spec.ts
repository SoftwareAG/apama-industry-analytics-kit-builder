import {Channel} from "./Channel";
import {validateSync, ValidationError} from "class-validator";
describe('Channel', () => {
  it("should be valid if using a correct name", () => {
    const chan = new Channel({name: 'Test Channel'});
    expect(chan.name).toEqual('Test Channel');
  });

  describe("Be invalid if using an incorrect name", () => {
    [null, undefined, [], {}, ''].forEach((name) => {
      it(`Name: ${name}`, () => {
        expect(() => { new Channel({name: name as any}); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if constructed with an invalid object", () => {
    [null, undefined, [], {}, ''].forEach((obj) => {
      it(`Construction Object: ${obj}`, () => {
        expect(() => { new Channel(obj as any); }).toThrowError();
      })
    });
  });
});
