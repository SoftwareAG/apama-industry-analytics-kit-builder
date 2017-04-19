import {PropertyDef, PropertyDefBuilder, PropertyDefInterface, PropertyDefJsonInterface} from "./PropertyDef";
import {NestedClassBuilder, ClassArrayBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {AbstractModel} from "./AbstractModel";

export interface PropertyJsonInterface extends PropertyDefJsonInterface {
  value?: number | string | boolean;
}

export interface PropertyInterface extends PropertyDefInterface {
  value?: number | string | boolean;
}

export class Property extends PropertyDef implements AsObservable, BehaviorSubjectify<PropertyInterface>, AbstractModel<PropertyJsonInterface>  {
  readonly value: BehaviorSubject<number | string | boolean | undefined>;

  constructor(obj: PropertyInterface) {
    super(obj);
    this.value = new BehaviorSubject(obj.value);
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      super.asObservable(),
      this.value
    ).mapTo(this);
  }
}

export class PropertyBuilder extends PropertyDefBuilder implements PropertyInterface {
  value?: number | string | boolean;

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

export class PropertySerializer {
  toApama(property: PropertyJsonInterface) {
    return "" +
      property.value !== undefined ? `"${property.name}":"${PropertySerializer.valueFromType(property.value, property.type)}"` : "";
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
