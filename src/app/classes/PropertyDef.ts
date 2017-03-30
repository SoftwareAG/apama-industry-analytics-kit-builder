import {Validator} from "class-validator";
const validator = new Validator();
import * as _ from "lodash";

export interface PropertyDefInterface {
  name: string,
  description: string,
  type: "integer" | "string" | "float" | "decimal" | "boolean",
  optional?: boolean
}

export class PropertyDef {
  readonly name: string;
  readonly description: string;
  readonly type: "integer" | "string" | "float" | "decimal" | "boolean";
  readonly optional?: boolean;

  constructor(obj: PropertyDefInterface) {
    if (!_.isPlainObject(obj)) { throw new Error('must have an object to construct from'); }
    if (!validator.isString(obj.name) || validator.isEmpty(obj.name)) {  throw new Error('Unable to parse json object'); }
    if (!validator.isString(obj.description) || validator.isEmpty(obj.description)) {  throw new Error('Unable to parse json object'); }
    if (!validator.isIn(obj.type, ['integer', 'string', 'float', 'boolean', 'decimal'])) {  throw new Error('Unable to parse json object'); }
    if (!validator.isIn(obj.optional, [true, false, undefined])) {  throw new Error('Unable to parse json object'); }
    this.name = obj.name;
    this.description = obj.description;
    this.type = obj.type;
    this.optional = obj.optional;
  }
}
