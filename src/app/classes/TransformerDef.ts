import {Validator} from "class-validator";
import {PropertyDef, PropertyDefInterface} from "./PropertyDef";
import * as _ from "lodash";

const validator = new Validator();

export interface TransformerDefInterface {
  name: string,
  properties?: ReadonlyArray<PropertyDefInterface>
}

export class TransformerDef {
  readonly name: string;
  readonly properties: ReadonlyArray<PropertyDef>;

  constructor(obj: TransformerDefInterface) {
    if (!_.isPlainObject(obj)) { throw new Error('must have an object to construct from'); }
    const properties = obj.properties || [];
    if (!validator.isArray(properties)) { throw new Error(`Unable to construct Transformer, invalid properties: ${obj.properties}`); }
    if (!validator.isString(obj.name) || obj.name == '') { throw new Error(`Unable to construct Transformer, invalid name: ${obj.name}`); }
    this.name = obj.name;
    this.properties = properties.map(propertyObj => { return new PropertyDef(propertyObj); });
    if (!validator.arrayUnique(this.properties.map(prop => { return prop.name }))) { throw new Error('Unable to parse json object'); }
  }
}
