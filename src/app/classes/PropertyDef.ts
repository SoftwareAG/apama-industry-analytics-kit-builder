import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
export interface PropertyDefInterface {
  name: string;
  description: string;
  type: "integer" | "string" | "float" | "decimal" | "boolean";
  optional?: boolean;
}

export class PropertyDef implements AsObservable, BehaviorSubjectify<PropertyDefInterface> {
  readonly name: BehaviorSubject<string>;
  readonly description: BehaviorSubject<string>;
  readonly type: BehaviorSubject<"integer" | "string" | "float" | "decimal" | "boolean">;
  readonly optional: BehaviorSubject<boolean>;

  constructor(obj: PropertyDefInterface) {
    this.name = new BehaviorSubject(obj.name);
    this.description = new BehaviorSubject(obj.description);
    this.type = new BehaviorSubject(obj.type);
    this.optional = new BehaviorSubject(!!obj.optional);
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.name,
      this.description,
      this.type,
      this.optional
    ).mapTo(this);
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
