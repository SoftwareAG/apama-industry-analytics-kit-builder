import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {validate} from "validate.js";
import {AbstractModel} from "app/classes/AbstractModel";
import {List} from "immutable";

export interface PropertyDefJsonInterface {
  name: string;
  description: string;
  type: "integer" | "string" | "float" | "decimal" | "boolean";
  optional?: boolean;
  defaultValue?: string | number | boolean;
  validValues?: any[];
  validator?: string;
  repeated?: boolean;
}

export interface PropertyDefInterface {
  name: string;
  description: string;
  type: "integer" | "string" | "float" | "decimal" | "boolean";
  optional?: boolean;
  defaultValue?: string | number | boolean;
  validValues?: string[] | number[] | boolean[];
  validator?: string;
  repeated?: boolean;
}

export class PropertyDef extends AbstractModel<PropertyDefJsonInterface, never> {
  readonly name: string;
  readonly description: string;
  readonly type: "integer" | "string" | "float" | "decimal" | "boolean";
  readonly optional: boolean | string; // string must be a function
  readonly defaultValue?: string | number | boolean;
  readonly validValues?: List<string | number | boolean>;
  readonly validator?: string;
  readonly repeated: boolean;

  constructor(obj: PropertyDefInterface) {
    super();
    this.name = obj.name;
    this.description = obj.description;
    this.type = obj.type;
    //noinspection PointlessBooleanExpressionJS
    this.optional = !!obj.optional;
    this.defaultValue = obj.defaultValue;
    this.validValues = obj.validValues !== undefined ? List(obj.validValues) as List<string> | List<number> | List<boolean> : undefined;
    this.validator = obj.validator;
    //noinspection PointlessBooleanExpressionJS
    this.repeated = !!obj.repeated;
  }

  validate(): this {
    if (!validate.isString(this.name)) { throw new Error('name must be a string'); }
    if (validate.isEmpty(this.name)) { throw new Error('name cannot be empty'); }

    // validate description
    if (!validate.isString(this.description)) { throw new Error('description must be a string'); }
    if (validate.isEmpty(this.description)) { throw new Error('description cannot be empty'); }

    // validate type
    if (!validate.isString(this.type)) { throw new Error('type must be a string'); }
    if(!["integer", "string", "float", "decimal", "boolean"].includes(this.type)) { throw new Error(`type cannot be ${this.type}`) }

    function isFunctionString(value: any) {
      return validate.isString(value) && value.match(/^\s*function\s*\(.*\)\s*{.*}\s*$/)
    }

    // validate optional
    // If the optional element has been provided, it must contain boolean data
    if (!validate.isBoolean(this.optional) && !isFunctionString(this.optional)) { throw new Error('optional must be a boolean or a function string') }

    // validate defaultValue
    // If the optional element has been provided, it must contain string | number | boolean data
    if (this.defaultValue !== undefined) {
      if (!validate.isBoolean(this.defaultValue)
        && !validate.isNumber(this.defaultValue)
        && !validate.isString(this.defaultValue)) {
        throw new Error('defaultValue must contain String | Number | Boolean data');
      }
    }

    // If the validValues element has been provided, it must be an array
    if (this.validValues !== undefined) {
      if (!(this.validValues instanceof List)) { throw new Error('validValues must be a List') }
      this.validValues.forEach((validValue: string | number | boolean) => {
        if (!validate.isBoolean(validValue) && !validate.isNumber(validValue) && !validate.isString(validValue)) {
          throw new Error('validValues must be a string, boolean, or number');
        }
      });
    }

    // If a validator element has been provided, it must contain a function string
    if (this.validator  !== undefined && !isFunctionString(this.validator)) { throw new Error('Must be a function string') }

    // validate repeated
    // If the repeated element has been provided, it must contain boolean data
    if (this.repeated !== undefined && !validate.isBoolean(this.repeated)) { throw new Error('repeated must contain Boolean data'); }
    return this;
  }
}

export class PropertyDefBuilder extends ClassBuilder<PropertyDef> implements PropertyDefInterface {
  name: string;
  description: string;
  type: "integer" | "string" | "float" | "decimal" | "boolean";
  optional: boolean = false;
  defaultValue?: string | number | boolean | undefined;
  validValues?: string[] | number[] | boolean[] | undefined;
  validator?: string;
  repeated: boolean = false;

  Name(name: string): this {
    this.name = name;
    return this;
  }
  Description(description: string): this {
    this.description = description;
    return this;
  }
  Type(type: "integer" | "string" | "float" | "decimal" | "boolean"): this {
    this.type = type;
    return this;
  }
  Optional(optional: boolean): this {
    this.optional = optional;
    return this;
  }
  DefaultValue(defaultValue: string | number | boolean | undefined): this {
    this.defaultValue = defaultValue;
    return this;
  }
  ValidValues(validValues: string[] | number[] | boolean[] | undefined) : this {
    this.validValues = validValues;
    return this;
  }
  Validator(validator: string | undefined) : this {
    this.validator = validator;
    return this;
  }
  Repeated(repeated: boolean) : this {
    this.repeated = repeated;
    return this;
  }
  build(): PropertyDef {
    return new PropertyDef(this);
  }

  static fromJson(jsonData: PropertyDefJsonInterface) : PropertyDefBuilder {
    // validate jsonData object
    if (!validate.isObject(jsonData)) { throw new Error('jsonData is invalid'); }
    if (!validate.contains(jsonData, 'name')) { throw new Error(`jsonData does not contain the "name" element : ${JSON.stringify(jsonData)}`); }
    if (!validate.contains(jsonData, 'description')) { throw new Error('jsonData does not contain the "description" element'); }
    if (!validate.contains(jsonData, 'type')) { throw new Error('jsonData does not contain the "type" element'); }

    //noinspection PointlessBooleanExpressionJS
    return new PropertyDefBuilder()
      .Name(jsonData.name)
      .Description(jsonData.description)
      .Type(jsonData.type)
      .Optional(!!jsonData.optional)
      .DefaultValue(jsonData.defaultValue)
      .ValidValues(jsonData.validValues)
      .Validator(jsonData.validator)
      .Repeated(!!jsonData.repeated);
  }
}

export class NestedPropertyDefBuilder<Parent> extends PropertyDefBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (propertyDef: PropertyDef) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class PropertyDefArrayBuilder extends ClassArrayBuilder<PropertyDef, NestedPropertyDefBuilder<PropertyDefArrayBuilder>> {
  constructor() {
    super(NestedPropertyDefBuilder);
  }
}
