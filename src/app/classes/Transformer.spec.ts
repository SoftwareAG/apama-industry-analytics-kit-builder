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
          properties: [
            { name: "prop1", type: testCase.type as "string" | "integer" | "boolean" | "float" | "decimal", description: "A property"}
          ],
          propertyValues: [
            { name: "prop1", definitionName: "prop1", value: testCase.value}
          ]
        }).build();
        expect(result.properties.get(0).type).toEqual(testCase.type);
        expect(result.propertyValues.getValue().get(0).value.getValue()).toEqual(testCase.value);
      });
    });
  });

  describe('should correctly parse repeated properties', () => {
    for(let i = 0; i < 3; i++) {
      it(`number of values: ${i}`, () =>{
        const result = TransformerBuilder.fromJson({
          name: "myFirstAnalytic",
          properties: [
            { name: "prop1", type: "string", description: "A property", repeated: true}
          ],
          propertyValues: new Array(i).fill(undefined).map(() => { return { name: `prop${i}`, definitionName: "prop1", value: ""} })
        }).build();
        expect(result.properties.get(0).name).toEqual('prop1');
        expect(result.propertyValues.getValue().size).toEqual(i);
      });
    }
  });

  describe('should correctly parse optional properties', () => {
    for(let i = 0; i <= 1; i++) {
      it(`number of values: ${i}`, () =>{
        const result = TransformerBuilder.fromJson({
          name: "myFirstAnalytic",
          properties: [
            { name: "prop1", type: "string", description: "A property", optional: true}
          ],
          propertyValues: new Array(i).fill(undefined).map(() => { return { name: `prop${i}`, definitionName: "prop1", value: ""} })
        }).build();
        expect(result.properties.get(0).name).toEqual('prop1');
        expect(result.propertyValues.getValue().size).toEqual(i);
      });
    }
  });

  it('should throw an error while parsing if no definition is available', () => {
    expect(()=> {
      TransformerBuilder.fromJson({
        name: "myFirstAnalytic",
        properties: [],
        propertyValues: [
          { name: "prop1", definitionName: "prop1", value: ""}
        ]
      }).build()
    }).toThrowError();
  });

  it('should throw an error while parsing if too many values are provided for an optional property', () => {
    expect(()=> {
      TransformerBuilder.fromJson({
        name: "myFirstAnalytic",
        properties: [
          { name: "prop1", type: "string", description: "A property", optional: true}
        ],
        propertyValues: [
          { name: "prop1", definitionName: "prop1", value: ""},
          { name: "prop2", definitionName: "prop1", value: ""}
        ]
      }).build()
    }).toThrowError();
  });

  it('should throw an error while parsing if no values are provided for a non-optional property', () => {
    expect(()=> {
      TransformerBuilder.fromJson({
        name: "myFirstAnalytic",
        properties: [
          { name: "prop1", type: "string", description: "A property"}
        ],
        propertyValues: []
      }).build()
    }).toThrowError();
  });
});
