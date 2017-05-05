import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {validate} from "validate.js";
import {AbstractModel} from "app/classes/AbstractModel";

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

export class PropertyDef extends AbstractModel<PropertyDefJsonInterface> {
  readonly name: string;
  readonly description: string;
  readonly type: "integer" | "string" | "float" | "decimal" | "boolean";
  readonly optional: boolean;
  readonly defaultValue?: string | number | boolean;
  readonly validValues?: string[] | number[] | boolean[] | undefined;
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
    this.validValues = obj.validValues;
    this.validator = obj.validator;
    //noinspection PointlessBooleanExpressionJS
    this.repeated = !!obj.repeated;
  }
}

export class PropertyDefBuilder extends ClassBuilder<PropertyDef> implements PropertyDefInterface {
  name: string;
  description: string;
  type: "integer" | "string" | "float" | "decimal" | "boolean";
  optional: boolean = false;
  defaultValue?: string | number | boolean | undefined;
  validValues?: string[] | number[] | boolean[] | undefined;
  validator?: string | undefined;
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

    if (!validate.contains(jsonData, 'name')) { throw new Error('jsonData does not contain the "name" element'); }
    if (!validate.isString(jsonData.name)) { throw new Error('name must contain string data'); }
    if (validate.isEmpty(jsonData.name)) { throw new Error('name cannot be empty'); }

    // validate description
    if (!validate.contains(jsonData, 'description')) { throw new Error('jsonData does not contain the "description" element'); }
    if (!validate.isString(jsonData.description)) { throw new Error('description must contain string data'); }
    if (validate.isEmpty(jsonData.description)) { throw new Error('description cannot be empty'); }

    // validate type
    if (!validate.contains(jsonData, 'type')) { throw new Error('jsonData does not contain the "type" element'); }
    if (!validate.isString(jsonData.type)) { throw new Error('type must contain string data'); }

    // Confirm that the data in the type element is valid
    if(!validate.contains(["integer", "string", "float", "decimal", "boolean"], jsonData.type)) {
      throw new Error(`type cannot contain ${jsonData.type} data`);
    }

    // validate optional
    // If the optional element has been provided, it must contain boolean data
    if ( validate.contains(jsonData, 'optional') && !validate.isBoolean(jsonData.optional) && !(validate.isString(jsonData.optional) && jsonData.optional.match(/^\s*function\s*\(.*\}\s*$/))) { throw new Error('optional must contain Boolean data'); }

    // validate defaultValue
    // If the optional element has been provided, it must contain string | number | boolean data
    if (jsonData.defaultValue !== undefined) {
      if (!validate.isBoolean(jsonData.defaultValue)
          && !validate.isNumber(jsonData.defaultValue)
          && !validate.isString(jsonData.defaultValue as any)) {
        throw new Error('defaultValue must contain String | Number | Boolean data');
      }
    }

    // If the validValues element has been provided, it must be an array
    if (jsonData.validValues !== undefined && !validate.isArray(jsonData.validValues)) {
      throw new Error('validValues must be an array');
    }

    // If a validator element has been provided, it must contain string data
    if (jsonData.validator !== undefined && !validate.isString(jsonData.validator)) {
      throw new Error('validator must be a string');
    }

    // validate repeated
    // If the repeated element has been provided, it must contain boolean data
    if (validate.contains(jsonData, 'repeated') && !validate.isBoolean(jsonData.repeated)) { throw new Error('repeated must contain Boolean data'); }

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
