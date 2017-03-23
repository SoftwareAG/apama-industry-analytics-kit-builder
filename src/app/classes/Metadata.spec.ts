
import {Metadata} from "./Metadata";
import * as deepFreeze from "deep-freeze";
import {TransformerDef} from "./TransformerDef";
import {PropertyDef} from "./PropertyDef";
describe('Metadata', () => {
  const validMetadata = deepFreeze({ transformers: [] });
  const validDeepMetadata = deepFreeze({
    transformers: [{
      name: "MyFirstAnalytic",
      properties: [{ name: "Property1", optional: true, type: "integer" as "integer" }]
    }]
  });

  describe("Should throw an error if constructed with an invalid object", () => {
    [null, [], ''].forEach((obj) => {
      it(`Construction Object: ${obj}`, () => {
        expect(() => { new Metadata(obj as any); }).toThrowError();
      })
    });
  });

  describe("Should throw an error if constructed with an invalid transformers array", () => {
    [true, {}, 'hello'].forEach((invalidArr) => {
      it(`Transformers: ${invalidArr}`, () => {
        expect(() => { new Metadata({ transformers: invalidArr } as any); }).toThrowError();
      })
    });
  });

  it("Should throw an error if constructed with multiple transformers with the same name", () => {
    expect(() => { new Metadata({ transformers: [{ name: "MyFirstAnalytic" }, { name: "MyFirstAnalytic" }] }); }).toThrowError();
  });

  it('should be instantiable from an object', () => {
    const meta = new Metadata(validMetadata);
    expect(meta).toEqual(jasmine.any(Metadata));
    expect(meta.transformers).toBeEmptyArray();
  });

  it('should be instantiable from a deeply nested object', () => {
    const meta = new Metadata(validDeepMetadata);
    expect(meta).toEqual(jasmine.any(Metadata));
    expect(meta.transformers).toBeArrayOfSize(1);

    const transformer = meta.transformers[0];
    expect(transformer).toEqual(jasmine.any(TransformerDef));
    expect(transformer.name).toEqual('MyFirstAnalytic');
    expect(transformer.properties).toBeArrayOfSize(1);

    const property = transformer.properties[0];
    expect(property).toEqual(jasmine.any(PropertyDef));
    expect(property.name).toEqual("Property1");
    expect(property.optional).toEqual(true);
    expect(property.type).toEqual("integer");
  });
});
