import {PropertyDef, PropertyDefBuilder, PropertyDefInterface, PropertyDefJsonInterface} from "./PropertyDef";
import {NestedClassBuilder, ClassArrayBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {AbstractModel} from "./AbstractModel";
import {Injectable} from "@angular/core";

export interface PropertyJsonInterface {
  name: string;
  definitionName: string;
  value: number | string | boolean;
}

interface ModifiablePropertyInterface {
  name: string;
  value: number | string | boolean;
}

interface UnmodifiablePropertyInterface {
  definitionName: string;
}

export interface PropertyInterface extends ModifiablePropertyInterface, UnmodifiablePropertyInterface {}

export class Property extends AbstractModel<PropertyJsonInterface> implements AsObservable, BehaviorSubjectify<ModifiablePropertyInterface>, UnmodifiablePropertyInterface {
  readonly name: BehaviorSubject<string>;
  readonly definitionName: string;
  readonly value: BehaviorSubject<number | string | boolean>;

  constructor(obj: PropertyInterface) {
    super();
    this.name = new BehaviorSubject(obj.name);
    this.definitionName = obj.definitionName;
    this.value = new BehaviorSubject(obj.value);
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.name,
      this.value
    ).mapTo(this);
  }
}

export class PropertyBuilder implements PropertyInterface {
  name: string = "";
  definitionName: string;
  value: number | string | boolean;

  Name(name: string): this {
    this.name = name;
    return this;
  }
  DefinitionName(definitionName: string): this {
    this.definitionName = definitionName;
    return this;
  }
  Value(value:  number | string | boolean): this {
    this.value = value;
    return this;
  }

  build(): Property {
    if (!this.definitionName) { throw new Error("Must have a valid definition name"); }
    if (this.value === undefined) { throw new Error("Must have a value"); }

    return new Property(this);
  }

  static fromPropertyDefBuilder(propertyDefBuilder: PropertyDefBuilder): PropertyBuilder {
    const result = new PropertyBuilder()
      .DefinitionName(propertyDefBuilder.name);
    if (!propertyDefBuilder.repeated) {
      result.Name(propertyDefBuilder.name)
    }
    // Deliberately does not use defaultValue, defaultValue is just a string label to be used by the UI
    if (propertyDefBuilder.validValues && propertyDefBuilder.validValues.length) {
      result.Value(propertyDefBuilder.validValues[0]);
    } else {
      switch (propertyDefBuilder.type) {
        case 'string':
          result.Value("");
          break;
        case 'float':
        case 'decimal':
        case 'integer':
          result.Value(0);
          break;
        case 'boolean':
          result.Value(false);
          break;
      }
    }
    return result;
  }

  static fromJson(json: PropertyInterface): PropertyBuilder {
    return new PropertyBuilder()
      .Name(json.name)
      .DefinitionName(json.definitionName)
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

export class NestedPopulatedPropertyBuilder<Parent> implements NestedClassBuilder<Parent> {
  private readonly propertyDefBuilder = new PropertyDefBuilder();
  private readonly propertyBuilder = new PropertyBuilder();

  constructor(private callback: (propertyDef: PropertyDef, property: Property) => Parent) {}

  Name(name: string): this {
    this.propertyDefBuilder.Name(name);
    this.propertyBuilder.Name(name);
    this.propertyBuilder.DefinitionName(name);
    return this;
  }

  Description(description: string): this {
    this.propertyDefBuilder.Description(description);
    return this;
  }

  Type(type: "string" | "boolean" | "integer" | "float" | "decimal"): this {
    this.propertyDefBuilder.Type(type);
    return this;
  }

  Optional(optional: boolean): this {
    this.propertyDefBuilder.Optional(optional);
    return this;
  }

  DefaultValue(defaultValue: string | number | boolean | undefined): this {
    this.propertyDefBuilder.DefaultValue(defaultValue);
    return this;
  }

  ValidValues(validValues: string[] | number[] | boolean[] | undefined): this {
    this.propertyDefBuilder.ValidValues(validValues);
    return this;
  }

  Validator(validator: string | undefined): this {
    this.propertyDefBuilder.Validator(validator);
    return this;
  }

  /* Can't use this builder with these properties */
  // Repeated(repeated: boolean): this {}
  // DefinitionName(definitionName: string): this {}

  Value(value: string | number | boolean): this {
    this.propertyBuilder.Value(value);
    return this;
  }

  endWith(): Parent {
    return this.callback(this.propertyDefBuilder.build(), this.propertyBuilder.build());
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
  toApama(property: PropertyJsonInterface, apamaType: "integer" | "string" | "float" | "decimal" | "boolean") {
    if (!property.name) {
      console.error("SerializationError: Property should have a name");
      return "";
    }

    return `"${property.name}":"${PropertySerializer.valueFromType(property.value, apamaType)}"`;
  }

  private static valueFromType(jsValue: number | string | boolean | undefined, apamaType: "integer" | "string" | "float" | "decimal" | "boolean") {
    switch(apamaType) {
      case 'string':
        return `${jsValue}`;
      case 'float':
        return `${this.numberToFloatOrDecimal(jsValue as number)}f`;
      case 'decimal':
        return `${this.numberToFloatOrDecimal(jsValue as number)}d`;
      case 'integer':
        return `${jsValue}`;
      case 'boolean':
        return jsValue ? "true" : "false";
      default:
        throw new Error(`Unhandled apamaType: ${apamaType}`);
    }
  }

  private static numberToFloatOrDecimal(value: number) {
    const string = value.toString();
    if (-1 === string.indexOf('.')){
      return string + '.0';
    } else {
      return string;
    }
  }
}
