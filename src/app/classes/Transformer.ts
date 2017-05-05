import {NestedPropertyBuilder, Property, PropertyBuilder, PropertyJsonInterface, PropertySerializer,
  NestedPopulatedPropertyBuilder} from "./Property";
import {
  TransformerDef,
  TransformerDefBuilder,
  TransformerDefInterface,
  TransformerDefJsonInterface
} from "./TransformerDef";
import {ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {List} from "immutable";
import {BehaviorSubject, Observable} from "rxjs";
import {RowJsonInterface} from "./Row";
import {Injectable} from "@angular/core";
import * as _ from 'lodash';
import {PropertyDefBuilder} from "./PropertyDef";

export interface TransformerJsonInterface extends TransformerDefJsonInterface {
  name: string;
  propertyValues?: PropertyJsonInterface[]
}

interface ModifiableTransformerInterface {
  propertyValues: Property[];
}

export interface TransformerInterface extends ModifiableTransformerInterface, TransformerDefInterface {}

export class Transformer extends TransformerDef implements AsObservable, BehaviorSubjectify<ModifiableTransformerInterface> {
  readonly name: string;
  readonly propertyValues: BehaviorSubject<List<Property>>;

  constructor(obj: TransformerInterface) {
    super(obj);
    this.name = obj.name;
    this.propertyValues = new BehaviorSubject(List(obj.propertyValues));
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.propertyValues,
      this.propertyValues.switchMap(properties => Observable.merge(...properties.map(property => (property as Property).asObservable()).toArray()))
    ).mapTo(this);
  }
}

export class TransformerBuilder extends TransformerDefBuilder implements TransformerInterface, ClassBuilder<Transformer> {
  propertyValues: Property[] = [];

  Name(name): this {
    this.name = name;
    return this;
  }
  PropertyValues(properties: Property[]): this {
    this.propertyValues = properties;
    return this;
  }
  pushPropertyValue(...property: Property[]): this {
    this.propertyValues.push(...property);
    return this;
  }
  withPropertyValue(): NestedPropertyBuilder<this> {
    return new NestedPropertyBuilder((property) => { this.propertyValues.push(property); return this; })
  }
  withPopulatedProperty(): NestedPopulatedPropertyBuilder<this> {
    return new NestedPopulatedPropertyBuilder((propertyDef, property) => { this.properties.push(propertyDef); this.propertyValues.push(property); return this; })
  }

  validate() {
    const propertiesByName = this.properties.reduce((result, property) => {
      result[property.name] = property;
      return result;
    }, {});

    const propertyValsByDefName = this.propertyValues.reduce((result, propertyVal) => {
      if (!result[propertyVal.definitionName]) {
        result[propertyVal.definitionName] = []
      }
      result[propertyVal.definitionName].push(propertyVal);
      return result;
    }, {});

    this.propertyValues.forEach(propertyVal => {
      if (!propertiesByName.hasOwnProperty(propertyVal.definitionName)) { throw new Error(`PropertyDefinition "${propertyVal.definitionName}" does not exist so propertyValue shouldn't exist`); }
    });

    this.properties.forEach(propertyDef =>{
      const propertyVals = propertyValsByDefName[propertyDef.name] || [];
      if (propertyDef.repeated) {

      } else if (propertyDef.optional) {
        if (propertyVals.length > 1) { throw new Error(`Optional property [${propertyVals}] cannot have more than 1 value, there were: ${propertyVals.length}`)}
      } else {
        if (propertyVals.length !== 1) { throw new Error(`Non-optional property [${propertyVals}] must have exactly one value, there were: ${propertyVals.length}`)}
      }
    });
  }

  build(skipValidation: boolean = false): Transformer {
    if (!skipValidation) {
      this.validate();
    }
    return new Transformer(this);
  }

  static fromTransformerDefBuilder(transformerDefBuilder: TransformerDefBuilder): TransformerBuilder {
    return Object.assign(new TransformerBuilder(), transformerDefBuilder)
      .PropertyValues(
        transformerDefBuilder.properties
          .filter(propertyDef => !propertyDef.optional && !propertyDef.repeated)
          .map(propertyDef => PropertyBuilder.fromPropertyDefBuilder(PropertyDefBuilder.fromJson(propertyDef.toJson())).build())
      );
  }

  static fromJson(json: TransformerJsonInterface): TransformerBuilder {
    return this.fromTransformerDefBuilder(TransformerDefBuilder.fromJson(json))
      .PropertyValues((json.propertyValues || []).map(propertyJson => PropertyBuilder.fromJson(propertyJson).build()));
  }
}

export class NestedTransformerBuilder<Parent> extends TransformerBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (transformer: Transformer) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}
@Injectable()
export class TransformerSerializer {
  constructor(private propertySerializer: PropertySerializer) {}

  toApama(transformer: TransformerJsonInterface, transformerIndex: number, row: RowJsonInterface, rowIndex: number) {
    const namespace  = 'com.industry.analytics';

    if (!transformer.name) {
      throw Error(`Serialization Error (Row:${rowIndex}, Transformer:${transformerIndex}): Transformer must have a name`);
    }

    return `${namespace}.Analytic(` +
      `"${transformer.name}",` +
      "[" +
        TransformerSerializer.getInChannels(transformer, transformerIndex, row, rowIndex) +
      "]," +
      "[" +
        TransformerSerializer.getOutChannels(transformer, transformerIndex, row, rowIndex) +
      "]," +
      "{" +
        (transformer.propertyValues || []).map(propertyVal => {
          const propertyDef = _.find(transformer.properties || [], (propertyDef) => propertyDef.name === propertyVal.definitionName);
          if (!propertyDef) {
            console.error(`Unable to find PropertyDefinition for "${propertyVal.definitionName}", will assume type string`)
          }
          const type = propertyDef ? propertyDef.type : "string";
          return this.propertySerializer.toApama(propertyVal, type);
        }) +
      "}" +
    ")";
  }

  private static getInChannels(transformer: TransformerJsonInterface, transformerIndex: number, row: RowJsonInterface, rowIndex: number) : string {
    return "\"" + (transformer.inputChannels || []).map((channel, channelIndex) => {
      if (transformerIndex === 0) {
        let channelOverride;
        if (channelIndex < row.inputChannelOverrides.length && (channelOverride = row.inputChannelOverrides[channelIndex])) {
          return channelOverride.name;
        } else {
          return `Row${rowIndex}:Input${channelIndex}`;
        }
      } else {
        return `Row${rowIndex}:Channel${transformerIndex}`
      }
    }).join("\",\"") + "\""
  }

  private static getOutChannels(transformer: TransformerJsonInterface, transformerIndex: number, row: RowJsonInterface, rowIndex: number) : string {
    return "\"" + (transformer.outputChannels || []).map((channel, channelIndex) => {
      if (transformerIndex === row.transformers.length-1) {
        let channelOverride;
        if (channelIndex < row.outputChannelOverrides.length && (channelOverride = row.outputChannelOverrides[channelIndex])) {
          return channelOverride.name;
        } else {
          return `Row${rowIndex}:Output${channelIndex}`;
        }
      } else {
        return `Row${rowIndex}:Channel${transformerIndex+1}`
      }
    }).join("\",\"") + "\""
  }
}
