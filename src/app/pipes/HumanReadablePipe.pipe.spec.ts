import {HumanReadablePipe} from "./HumanReadablePipe.pipe";

describe('HumanReadablePipe', () => {
  const pipe = new HumanReadablePipe();

  [
    {test: "", result: ""},
    {test: "abc", result: "Abc"},
    {test: " abc ", result: "Abc"},
    {test: "123 abc", result: "123 Abc"},
    {test: "123abc", result: "123abc"},
    {test: "appleBananaCarrot", result: "Apple Banana Carrot"},
    {test: "appleBanana Carrot", result: "Apple Banana Carrot"},
    {test: "aBC", result: "A B C"},
    {test: "apple-banana-carrot", result: "Apple-Banana-Carrot"},
    {test: "a\tb", result: "A B"},
    {test: "a  b", result: "A B"},
    {test: "\ta  \t \t\t b ", result: "A B"},
    {test: "a_b", result: "A B"},
  ].forEach((testCase) => {
    it(`should correctly transform: "${testCase.test}" into "${testCase.result}"`, () => {
      expect(pipe.transform(testCase.test)).toEqual(testCase.result);
    })
  });
});
