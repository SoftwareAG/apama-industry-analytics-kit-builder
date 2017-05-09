import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {TransformerBuilder} from "./Transformer";
describe('Transformer', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new TransformerBuilder().build(), done).then(done);
  });

  describe('should correctly parse properties of any type from json', () => {
    [
      { type: "string", value: "helloWorld"},
      { type: "integer", value: 1},
      { type: "float", value: 10.1},
      { type: "decimal", value: 10.1},
      { type: "boolean", value: true}
    ].forEach(testCase => {
      it(`Type: ${testCase.type}`, () => {
        const result = TransformerBuilder.fromJson({
          name: "myFirstAnalytic",
          propertyValues: [
            { name: "prop1", definitionName: "prop1", value: testCase.value}
          ]
        }).build();
        expect(result.propertyValues.get(0).value.getValue()).toEqual(testCase.value);
      });
    });
  });

  describe('should correctly parse repeated properties', () => {
    for(let i = 0; i < 3; i++) {
      it(`number of values: ${i}`, () =>{
        const result = TransformerBuilder.fromJson({
          name: "myFirstAnalytic",
          propertyValues: new Array(i).fill(undefined).map(() => { return { name: `prop${i}`, definitionName: "prop1", value: ""} })
        }).build();
        expect(result.propertyValues.size).toEqual(i);
      });
    }
  });

  describe('should correctly parse optional properties', () => {
    for(let i = 0; i <= 1; i++) {
      it(`number of values: ${i}`, () =>{
        const result = TransformerBuilder.fromJson({
          name: "myFirstAnalytic",
          propertyValues: new Array(i).fill(undefined).map(() => { return { name: `prop${i}`, definitionName: "prop1", value: ""} })
        }).build();
        expect(result.propertyValues.size).toEqual(i);
      });
    }
  });
});
