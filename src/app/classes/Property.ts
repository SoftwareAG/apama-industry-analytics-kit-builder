import {PropertyDef, PropertyDefBuilder} from "./PropertyDef";
import {ClassArrayBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {AbstractModel} from "./AbstractModel";
import {Injectable} from "@angular/core";
import {validate} from "validate.js";
import {TransformerDef} from "./TransformerDef";
import * as _ from "lodash";
import {IgnoreableDeserializationError} from "./Errors";
import {Utils} from "../Utils";

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

export class Property extends AbstractModel<PropertyJsonInterface, PropertyDef> implements AsObservable, BehaviorSubjectify<ModifiablePropertyInterface>, UnmodifiablePropertyInterface {
  readonly name: BehaviorSubject<string>;
  readonly definitionName: string;
  readonly value: BehaviorSubject<number | string | boolean>;
  readonly invalid: BehaviorSubject<boolean | undefined>;

  constructor(obj: PropertyInterface) {
    super();
    this.name = new BehaviorSubject(obj.name);
    this.definitionName = obj.definitionName;
    this.value = new BehaviorSubject(obj.value);
    this.invalid = new BehaviorSubject(undefined);
  }

  asObservable(): Observable<this> {
    return Utils.hotObservable(Observable.merge(
      this.name,
      this.value,
      this.invalid
    ).mapTo(this));
  }

  validate(propertyDef: PropertyDef): this {
    if (validate.isString(this.definitionName) && !this.definitionName) { throw new Error("Must have a valid definition name"); }
    if (this.definitionName !== propertyDef.name) { throw new Error(`Definition name [${this.definitionName}] must match name of definition [${propertyDef.name}]`); }
    if (this.value === undefined) { throw new Error("Must have a value"); }
    const value = this.value.getValue();
    switch(propertyDef.type) {
      case 'string':
        if (!validate.isString(value)) { throw new Error(`value [${value}] is wrong type, should be: string`) }
        break;
      case 'float':
      case 'decimal':
      case 'integer':
        if (!validate.isNumber(value)) { throw new Error(`value [${value}] is wrong type, should be: number`) }
        break;
      case 'boolean':
        if (!validate.isBoolean(value)) { throw new Error(`value [${value}] is wrong type, should be: boolean`) }
        break;
    }
    return this;
  }
}

export class PropertyBuilder implements PropertyInterface {
  name: string = "";
  definitionName: string;
  value: number | string | boolean;

  NameAndDef(name: string) : this {
    this.name = name;
    this.definitionName = name;
    return this;
  }
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
    return new Property(this);
  }

  static fromPropertyDef(propertyDef: PropertyDef): PropertyBuilder {
    const result = new PropertyBuilder()
      .DefinitionName(propertyDef.name);
    if (!propertyDef.repeated) {
      result.Name(propertyDef.name)
    }
    // Deliberately does not use defaultValue, defaultValue is just a string label to be used by the UI
    if (propertyDef.validValues && propertyDef.validValues.size) {
      result.Value(propertyDef.validValues.get(0));
    } else {
      switch (propertyDef.type) {
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
  toApama(property: Property, propertyDef: PropertyDef) {
    property.validate(propertyDef);

    return `"${property.name.getValue()}":"${PropertySerializer.valueFromType(property.value.getValue(), propertyDef.type)}"`;
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

@Injectable()
export class PropertyDeserializer {
  readonly validatePropertiesPattern = /^{(\s*"[^"]*"\s*:\s*"\s*(?:[^"]*|\[[^\]]*])\s*"(?:\s*,\s*"[^"]*"\s*:\s*"\s*(?:[^"]*|\[[^\]]*])\s*")*\s*)?}$/;
  readonly propertiesPattern = /("[^"]*"\s*:\s*("\s*\[[^\]]*]\s*"|"[^"]*"))/g;
  readonly propertyPattern = /(?:"\s*(\[[^\]]*]\s*|[^"]*))"/g;

  /**
   *
   * @param transformerDef
   * @param analyticProperties eg {"a":"2.0d"} or {"!hasParam":"["a", "b", "c", "d"]"}
   */
  buildProperties(transformerDef: TransformerDef, analyticProperties: string): Property[] {
    if (!analyticProperties.match(this.validatePropertiesPattern)) {
      throw new Error(`Properties in ${transformerDef.name} is not valid : ${analyticProperties}`);
    }

    const properties = analyticProperties.match(this.propertiesPattern);
    if (properties && properties.length) {
      return _.flatMap(properties, property => {
        const data = property.match(this.propertyPattern);
        if (data && data.length == 2) {
          const [name, value] = data.map(d => d.replace(/^"/,'').replace(/"$/,''));

          const propertyDef = transformerDef.getProperty(name);
          if (propertyDef) {
            // Set the property value
            return [new PropertyBuilder()
              .NameAndDef(name)
              .Value(this.parseStringWithPropertyDef(value, propertyDef))
              .build()
              .validate(propertyDef)];
          } else {
            const repeatedPropertyDef = transformerDef.getRepeatedProperty();
            if (repeatedPropertyDef) {
              return [new PropertyBuilder()
                .Name(name)
                .DefinitionName(repeatedPropertyDef.name)
                .Value(this.parseStringWithPropertyDef(value, repeatedPropertyDef))
                .build()
                .validate(repeatedPropertyDef)];
            } else {
              console.error(new IgnoreableDeserializationError(`Analytic '${transformerDef.name}' does not contain property '${name}'`));
            }
          }
        } else {
          throw new IgnoreableDeserializationError(`Property must contain name and value pair e.g. "offset":"2.0d" (invalid property data is ${data})`);
        }
        return [];
      });
    }
    return [];
  }

  // TODO: Test ME separately!!!!
  private parseStringWithPropertyDef(stringValue: string, propertyDef: PropertyDef) {
    switch(propertyDef.type) {
      case "integer":
      case "decimal":
        const value = Number.parseInt(stringValue);
        if (Number.isNaN(value)) {
          throw new Error(`Property value "${stringValue}" cannot be converted to the required property ${propertyDef.type} type`);
        }
        return value;
      case "float":
        const floatValue = Number.parseFloat(stringValue);
        if (Number.isNaN(floatValue)) {
          throw new Error(`Property value "${stringValue}" cannot be converted to the required property ${propertyDef.type} type`);
        }
        return floatValue;
      case "string":
        return stringValue;
      case "boolean":
        if (stringValue === 'true') {
          return true;
        } else if (stringValue === 'false') {
          return false;
        } else {
          throw new Error(`Unable to parse "${stringValue}" to boolean`);
        }
      default:
        throw new Error(`Unhandled PropertyDef Type: ${propertyDef.type}`);
    }
  }
}
