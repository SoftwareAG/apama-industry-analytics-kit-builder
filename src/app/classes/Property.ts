import {PropertyDef, PropertyDefBuilder, PropertyDefInterface, PropertyDefJsonInterface} from "./PropertyDef";
import {NestedClassBuilder, ClassArrayBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {AbstractModel} from "./AbstractModel";
import {Injectable} from "@angular/core";

export interface PropertyJsonInterface extends PropertyDefJsonInterface {
  value?: number | string | boolean;
}

export interface PropertyInterface extends PropertyDefInterface {
  value?: number | string | boolean;
}

export class Property extends AbstractModel<PropertyDefJsonInterface> implements AsObservable, BehaviorSubjectify<PropertyInterface>  {
  readonly name: BehaviorSubject<string>;
  readonly description: BehaviorSubject<string>;
  readonly type: BehaviorSubject<"integer" | "string" | "float" | "decimal" | "boolean">;
  readonly optional: BehaviorSubject<boolean>;
  readonly value: BehaviorSubject<number | string | boolean | undefined>;

  constructor(obj: PropertyInterface) {
    super();
    this.name = new BehaviorSubject(obj.name);
    this.description = new BehaviorSubject(obj.description);
    this.type = new BehaviorSubject(obj.type);
    //noinspection PointlessBooleanExpressionJS
    this.optional = new BehaviorSubject(!!obj.optional);
    this.value = new BehaviorSubject(obj.value);
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.name,
      this.description,
      this.type,
      this.optional,
      this.value
    ).mapTo(this);
  }
}

export class PropertyBuilder implements PropertyInterface {
  name: string;
  description: string;
  type: "integer" | "string" | "float" | "decimal" | "boolean";
  optional?: boolean;
  value?: number | string | boolean;

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
  Value(value:  number | string | boolean | undefined): this {
    this.value = value;
    return this;
  }

  build(): Property {
    if (typeof this.value === 'undefined' && !this.optional) {
      switch(this.type) {
        case 'string':
          this.value = "";
          break;
        case 'float':
        case 'decimal':
        case 'integer':
          this.value = 0;
          break;
        case 'boolean':
          this.value = false;
          break;
      }
    }
    return new Property(this);
  }

  static fromPropertyDefBuilder(propertyDefBuilder: PropertyDefBuilder): PropertyBuilder {
    return Object.assign(new PropertyBuilder(), propertyDefBuilder);
  }

  static fromJson(json: PropertyJsonInterface): PropertyBuilder {
    return this.fromPropertyDefBuilder(PropertyDefBuilder.fromJson(json))
      .Value(json.value);
  }
}

export class NestedPropertyBuilder<Parent> extends PropertyBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (property: Property) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class PropertyArrayBuilder extends ClassArrayBuilder<Property, NestedPropertyBuilder<PropertyArrayBuilder>> {
  constructor() {
    super(NestedPropertyBuilder);
  }
}

@Injectable()
export class PropertySerializer {
  //noinspection JSMethodCanBeStatic
  toApama(property: PropertyJsonInterface) {
    if (!property.name) {
      console.error("SerializationError: Property should have a name");
      return "";
    }

    return property.value !== undefined ? `"${property.name}":"${PropertySerializer.valueFromType(property.value, property.type)}"` : "";
  }

  private static valueFromType(jsValue: number | string | boolean | undefined, apamaType: "integer" | "string" | "float" | "decimal" | "boolean") {
    switch(apamaType) {
      case 'string':
        return `${jsValue}`;
      case 'float':
        return `${jsValue}f`;
      case 'decimal':
        return `${jsValue}d`;
      case 'integer':
        return `${jsValue}`;
      case 'boolean':
        return jsValue ? "true" : "false";
    }
  }
}
