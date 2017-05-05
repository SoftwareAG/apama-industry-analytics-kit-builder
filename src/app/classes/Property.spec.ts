import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {PropertyBuilder} from "./Property";
import {PropertyDefBuilder} from "./PropertyDef";
describe('Property', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new PropertyBuilder().Name("A name").DefinitionName("A property definition").Value("A Value").build(), done).then(done);
  });

  describe('should correctly default the value when creating from PropertyDef', () => {
    [
      {type: "string", expectedDefault: ""},
      {type: "boolean", expectedDefault: false},
      {type: "integer", expectedDefault: 0},
      {type: "decimal", expectedDefault: 0},
      {type: "float", expectedDefault: 0}
    ].forEach((testCase) => {
      it(`Type: ${testCase.type}`, () => {
        expect(PropertyBuilder.fromPropertyDefBuilder(new PropertyDefBuilder().Type(testCase.type as "integer" | "string" | "float" | "decimal" | "boolean")).value).toEqual(testCase.expectedDefault);
      })
    })
  });

  describe('should correctly default the value when creating from PropertyDef with validValues', () => {
    [
      {type: "string", validValues: ["a", "b"], expectedDefault: "a"},
      {type: "boolean", validValues: [true, false], expectedDefault: true},
      {type: "integer", validValues: [1, 2, 3], expectedDefault: 1},
      {type: "decimal", validValues: [0.5, 1, 1.5], expectedDefault: 0.5},
      {type: "float", validValues: [0.3, 0.6, 1], expectedDefault: 0.3}
    ].forEach((testCase) => {
      it(`Type: ${testCase.type}, ValidValues: ${testCase.validValues}`, () => {
        expect(PropertyBuilder.fromPropertyDefBuilder(new PropertyDefBuilder().Type(testCase.type as "integer" | "string" | "float" | "decimal" | "boolean").ValidValues(testCase.validValues)).value).toEqual(testCase.expectedDefault);
      })
    })
  });
});
