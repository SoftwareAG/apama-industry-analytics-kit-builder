import {Validator} from "class-validator";
import {PropertyDef, PropertyDefBuilder, PropertyDefInterface} from "./PropertyDef";
import * as _ from "lodash";
import {NestedClassBuilder, ClassArrayBuilder} from "./ClassBuilder";

const validator = new Validator();

export interface PropertyInterface extends PropertyDefInterface {
  value?: number | string | boolean;
}

export abstract class Property extends PropertyDef implements PropertyInterface {
  value?: number | string | boolean;

  static fromObject(obj: PropertyInterface) : ValidProperty {
    if (!validator.isIn(typeof obj.value, ['undefined', 'number', 'string', 'boolean'])) {  throw new Error('Unable to parse json object'); }
    if (!validator.isIn(obj.type, ['integer', 'string', 'float', 'boolean', 'decimal'])) {  throw new Error('Unable to parse json object'); }
    if (!validator.isIn(obj.optional, [true, false, undefined])) {  throw new Error('Unable to parse json object'); }
    switch(obj.type) {
      case 'string': return obj.optional ? new OptionalStringProperty(obj) : new StringProperty(obj);
      case 'boolean': return obj.optional ? new OptionalBooleanProperty(obj) : new BooleanProperty(obj);
      case 'float':
      case 'decimal':
      case 'integer': return obj.optional ? new OptionalNumberProperty(obj) : new NumberProperty(obj);
      default: throw new Error('Unable to parse json object');
    }
  }
}

export class PropertyBuilder extends PropertyDefBuilder implements PropertyInterface {
  value?: number | string | boolean;

  Value(value:  number | string | boolean): this {
    this.value = value;
    return this;
  }

  build(): ValidProperty {
    return Property.fromObject(this);
  }
}

export class NestedPropertyBuilder<Parent> extends PropertyBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (property: ValidProperty) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class PropertyArrayBuilder extends ClassArrayBuilder<ValidProperty, NestedPropertyBuilder<PropertyArrayBuilder>> {
  constructor() {
    super(NestedPropertyBuilder);
  }
}

class StringProperty extends Property {
  value: string;
  readonly type = "string";
  readonly optional = false;

  constructor(obj: PropertyInterface) {
    super(obj);
    if (!validator.isString(obj.value)) { throw new Error('Unable to parse json object'); }
    if (obj.type != 'string') { throw new Error('Unable to parse json object'); }
    if (!validator.isIn(obj.optional, [false, undefined])) { throw new Error('Unable to parse json object'); }
    this.value = obj.value as string;
  }
}

class OptionalStringProperty extends Property {
  value?: string;
  readonly type = "string";
  readonly optional = true;

  constructor(obj: PropertyInterface) {
    super(obj);
    if (obj.value != undefined && !validator.isString(obj.value)) { throw new Error('Unable to parse json object'); }
    if (obj.type != 'string') { throw new Error('Unable to parse json object'); }
    if (!validator.isBoolean(obj.optional) || !obj.optional) { throw new Error('Unable to parse json object'); }
    this.value = obj.value as string | undefined;
  }
}

class BooleanProperty extends Property {
  value: boolean;
  readonly type = "boolean";
  readonly optional = false;

  constructor(obj: PropertyInterface) {
    super(obj);
    if (!validator.isBoolean(obj.value)) { throw new Error('Unable to parse json object'); }
    if (obj.type != 'boolean') { throw new Error('Unable to parse json object'); }
    if (!validator.isIn(obj.optional, [false, undefined])) { throw new Error('Unable to parse json object'); }
    this.value = obj.value as boolean;
  }
}

class OptionalBooleanProperty extends Property {
  value?: boolean;
  readonly type = "boolean";
  readonly optional = true;

  constructor(obj: PropertyInterface) {
    super(obj);
    if (obj.value != undefined && !validator.isBoolean(obj.value)) { throw new Error('Unable to parse json object'); }
    if (obj.type != 'boolean') { throw new Error('Unable to parse json object'); }
    if (!validator.isBoolean(obj.optional) || !obj.optional) { throw new Error('Unable to parse json object'); }
    this.value = obj.value as boolean | undefined;
  }
}

class NumberProperty extends Property {
  value: number;
  readonly type: "float" | "decimal" | "integer";
  readonly optional = false;

  constructor(obj: PropertyInterface) {
    super(obj);
    if (!validator.isNumber(obj.value)) { throw new Error('Unable to parse json object'); }
    if (!validator.isIn(obj.type, ["float", "decimal", "integer"])) { throw new Error('Unable to parse json object'); }
    if (!validator.isIn(obj.optional, [false, undefined])) { throw new Error('Unable to parse json object'); }
    if (obj.type == 'integer' && !validator.isInt(obj.value as number)) { throw new Error('Unable to parse json object'); }
    this.value = obj.value as number;
    this.type = obj.type as "float" | "decimal" | "integer";
  }
}

class OptionalNumberProperty extends Property {
  value?: number;
  type: "float" | "decimal" | "integer";
  optional = true;

  constructor(obj: PropertyInterface) {
    super(obj);
    if (obj.value != undefined && !validator.isNumber(obj.value)) { throw new Error('Unable to parse json object'); }
    if (!validator.isIn(obj.type, ["float", "decimal", "integer"])) { throw new Error('Unable to parse json object'); }
    if (!validator.isBoolean(obj.optional) || !obj.optional) { throw new Error('Unable to parse json object'); }
    if (obj.value != undefined && obj.type == 'integer' && !validator.isInt(obj.value as number)) { throw new Error('Unable to parse json object'); }
    this.value = obj.value as number | undefined;
    this.type = obj.type as "float" | "decimal" | "integer";
  }
}

export type ValidProperty = NumberProperty | OptionalNumberProperty | BooleanProperty | OptionalBooleanProperty | StringProperty | OptionalStringProperty;
