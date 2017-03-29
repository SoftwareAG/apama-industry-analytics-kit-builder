import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
export interface PropertyDefInterface {
  name: string;
  description: string;
  type: "integer" | "string" | "float" | "decimal" | "boolean";
  optional?: boolean;
}

export class PropertyDef implements PropertyDefInterface {
  readonly name: string;
  readonly description: string;
  readonly type: "integer" | "string" | "float" | "decimal" | "boolean";
  readonly optional?: boolean;

  constructor(obj: PropertyDefInterface) {
    this.name = obj.name;
    this.description = obj.description;
    this.type = obj.type;
    this.optional = obj.optional;
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
