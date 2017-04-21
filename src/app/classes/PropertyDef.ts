import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {validate} from "validate.js";
import {AbstractModel} from "app/classes/AbstractModel";

export interface PropertyDefJsonInterface {
  name: string;
  description: string;
  type: "integer" | "string" | "float" | "decimal" | "boolean";
  optional?: boolean;
}

export interface PropertyDefInterface {
  name: string;
  description: string;
  type: "integer" | "string" | "float" | "decimal" | "boolean";
  optional?: boolean;
}

export class PropertyDef extends AbstractModel<PropertyDefJsonInterface> {
  readonly name: string;
  readonly description: string;
  readonly type: "integer" | "string" | "float" | "decimal" | "boolean";
  readonly optional: boolean;

  constructor(obj: PropertyDefInterface) {
    super();
    this.name = obj.name;
    this.description = obj.description;
    this.type = obj.type;
    //noinspection PointlessBooleanExpressionJS
    this.optional = !!obj.optional;
  }
}

export class PropertyDefBuilder extends ClassBuilder<PropertyDef> implements PropertyDefInterface {
  name: string;
  description: string;
  type: "integer" | "string" | "float" | "decimal" | "boolean";
  optional?: boolean;

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
  Optional(optional?: boolean): this {
    this.optional = optional;
    return this;
  }
  build(): PropertyDef {
    return new PropertyDef(this);
  }

  static fromJson(jsonData: PropertyDefJsonInterface) : PropertyDefBuilder {

    // validate jsonData object
    if (!validate.isObject(jsonData)) { throw new Error('jsonData is invalid'); }

    // validate name
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
    if ( validate.contains(jsonData, 'optional') && !validate.isBoolean(jsonData.optional)) { throw new Error('optional must contain Boolean data'); }

    return new PropertyDefBuilder()
      .Name(jsonData.name)
      .Optional(jsonData.optional)
      .Description(jsonData.description)
      .Type(jsonData.type)
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
