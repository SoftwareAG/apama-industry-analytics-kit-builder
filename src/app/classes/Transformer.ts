import {NestedPropertyBuilder, Property, PropertyBuilder, PropertyJsonInterface, PropertySerializer} from "./Property";
import {TransformerDef, TransformerDefBuilder} from "./TransformerDef";
import {ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AsObservable} from "../interfaces/interfaces";
import {List, Map} from "immutable";
import {BehaviorSubject, Observable} from "rxjs";
import {Row} from "./Row";
import {Injectable} from "@angular/core";
import {PropertyDef} from "./PropertyDef";
import {AbstractModel} from "./AbstractModel";
import {
  NestedTransformerChannelBuilder,
  TransformerChannel,
  TransformerChannelBuilder,
  TransformerChannelJsonInterface
} from "./TransformerChannel";

export interface TransformerJsonInterface {
  name: string;
  propertyValues?: PropertyJsonInterface[]
  inputChannels?: TransformerChannelJsonInterface[]
  outputChannels?: TransformerChannelJsonInterface[]
}

export interface TransformerInterface {
  name: string;
  propertyValues: Property[];
  inputChannels: TransformerChannel[];
  outputChannels: TransformerChannel[];
}

export class Transformer implements AbstractModel<TransformerJsonInterface, TransformerDef>, AsObservable {
  readonly name: string;
  readonly propertyValuesByDefName: BehaviorSubject<Map<string, List<Property>>>;
  get propertyValues(): List<Property> {
    return List(this.propertyValuesByDefName.getValue().valueSeq().flatten(true));
  }
  get observablePropertyValues(): Observable<List<Property>> {
    return this.propertyValuesByDefName.map(propertyValuesByDefName => List(propertyValuesByDefName.valueSeq().flatten(true)));
  }
  readonly inputChannelsByDefName: BehaviorSubject<Map<string, List<TransformerChannel>>>;
  get inputChannels(): List<TransformerChannel> {
  return List(this.inputChannelsByDefName.getValue().valueSeq().flatten(true));
}
  get observableInputChannels(): Observable<List<TransformerChannel>> {
    return this.inputChannelsByDefName.map(channelsByDefName => List(channelsByDefName.valueSeq().flatten(true)));
  }
  readonly outputChannelsByDefName: BehaviorSubject<Map<string, List<TransformerChannel>>>;
  get outputChannels(): List<TransformerChannel> {
    return List(this.outputChannelsByDefName.getValue().valueSeq().flatten(true));
  }
  get observableOutputChannels(): Observable<List<TransformerChannel>> {
    return this.outputChannelsByDefName.map(channelsByDefName => List(channelsByDefName.valueSeq().flatten(true)));
  }

  constructor(obj: TransformerInterface) {
    this.name = obj.name;
    // Group all of the property values by their definitionName
    this.propertyValuesByDefName = new BehaviorSubject(
      obj.propertyValues.reduce((result, propertyVal) => result.set(
        propertyVal.definitionName,
        result.get(propertyVal.definitionName, List<Property>()).push(propertyVal)
      ), Map<string, List<Property>>())
    );

    this.inputChannelsByDefName = new BehaviorSubject(
      obj.inputChannels.reduce((result, channel) => result.set(
        channel.name,
        result.get(channel.name, List<TransformerChannel>()).push(channel)
      ), Map<string, List<TransformerChannel>>())
    );

    this.outputChannelsByDefName = new BehaviorSubject(
      obj.outputChannels.reduce((result, channel) => result.set(
        channel.name,
        result.get(channel.name, List<TransformerChannel>()).push(channel)
      ), Map<string, List<TransformerChannel>>())
    )
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.propertyValuesByDefName,
      this.observableInputChannels,
      this.observableOutputChannels,
      this.observablePropertyValues.switchMap(properties => Observable.merge(...properties.map((property: Property) => property.asObservable()).toArray()))
    ).mapTo(this);
  }

  toJson(): TransformerJsonInterface {
    return {
      name: this.name,
      propertyValues: this.propertyValues.toArray().map(propertyVal => propertyVal.toJson())
    }
  }

  validate(transformerDef: TransformerDef): this {
    this.propertyValues.forEach((propertyVal: Property) => {
      if (!transformerDef.propertiesByName.has(propertyVal.definitionName)) { throw new Error(`PropertyDefinition "${propertyVal.definitionName}" does not exist so propertyValue shouldn't exist`); }
    });

    transformerDef.propertiesByName.forEach((propertyDef: PropertyDef) => {
      const propertyVals = this.propertyValuesByDefName.getValue().get(propertyDef.name) || [];
      if (propertyDef.repeated) {

      } else if (propertyDef.optional) {
        if (propertyVals.size > 1) { throw new Error(`Optional property [${propertyVals}] cannot have more than 1 value, there were: ${propertyVals.size}`)}
      } else {
        if (propertyVals.size !== 1) { throw new Error(`Non-optional property [${propertyVals}] must have exactly one value, there were: ${propertyVals.size}`)}
      }
    });

    return this;
  }

  getPropertyValues(name: string): List<Property> {
    return this.propertyValuesByDefName.getValue().get(name) || List();
  }

  addPropertyValue(propertyName: string, propertyValue: Property) {
    this.propertyValuesByDefName.next(
      this.propertyValuesByDefName.getValue()
        .update(
          propertyName,
          (propertyVals) => propertyVals ? propertyVals.push(propertyValue) : List.of(propertyValue)
        )
    )
  }

  removePropertyValue(propertyVal: Property) {
    this.propertyValuesByDefName.next(
      this.propertyValuesByDefName.getValue().update(
        propertyVal.definitionName,
        (propertyVals) => List<Property>(propertyVals.filter(p => p !== propertyVal))
      )
    )
  }
}

export class TransformerBuilder implements TransformerInterface, ClassBuilder<Transformer> {
  name: string;
  propertyValues: Property[] = [];
  inputChannels: TransformerChannel[] = [];
  outputChannels: TransformerChannel[] = [];

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
    return new NestedPropertyBuilder(property => { this.propertyValues.push(property); return this; })
  }
  InputChannels(channels: TransformerChannel[]): this {
  this.inputChannels = channels;
  return this;
}
  pushInputChannel(...channel: TransformerChannel[]): this {
    this.inputChannels.push(...channel);
    return this;
  }
  withInputChannel(): NestedTransformerChannelBuilder<this> {
    return new NestedTransformerChannelBuilder(channel => { this.inputChannels.push(channel); return this; })
  }
  OutputChannels(channels: TransformerChannel[]): this {
    this.outputChannels = channels;
    return this;
  }
  pushOutputChannel(...channel: TransformerChannel[]): this {
    this.outputChannels.push(...channel);
    return this;
  }
  withOutputChannel(): NestedTransformerChannelBuilder<this> {
    return new NestedTransformerChannelBuilder(channel => { this.outputChannels.push(channel); return this; })
  }

  build(): Transformer {
    return new Transformer(this);
  }

  static fromTransformerDef(transformerDef: TransformerDef): TransformerBuilder {
    return new TransformerBuilder()
      .Name(transformerDef.name)
      .PropertyValues(
        transformerDef.properties.toArray()
          .filter(propertyDef => !propertyDef.optional && !propertyDef.repeated)
          .map(propertyDef => PropertyBuilder.fromPropertyDef(propertyDef).build())
      )
      .InputChannels(
        transformerDef.inputChannels.toArray()
          .filter(channelDef => !channelDef.optional && !channelDef.repeated)
          .map(channelDef => TransformerChannelBuilder.fromTransformerChannelDef(channelDef).build())
      )
      .OutputChannels(
        transformerDef.outputChannels.toArray()
          .filter(channelDef => !channelDef.optional && !channelDef.repeated)
          .map(channelDef => TransformerChannelBuilder.fromTransformerChannelDef(channelDef).build())
      );
  }

  static fromJson(json: TransformerJsonInterface): TransformerBuilder {
    return new TransformerBuilder()
      .Name(json.name)
      .PropertyValues((json.propertyValues || []).map(propertyJson => PropertyBuilder.fromJson(propertyJson).build()))
      .InputChannels((json.inputChannels || []).map(channelJson => TransformerChannelBuilder.fromJson(channelJson).build()))
      .OutputChannels((json.outputChannels || []).map(channelJson => TransformerChannelBuilder.fromJson(channelJson).build()));
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

  toApama(transformer: Transformer, transformerDef: TransformerDef, transformerIndex: number, row: Row, rowIndex: number) {
    const namespace  = 'com.industry.analytics';

    transformer.validate(transformerDef);

    return `${namespace}.Analytic(` +
      `"${transformer.name}",` +
      "[" +
        TransformerSerializer.getInChannels(transformerDef, transformerIndex, row, rowIndex) +
      "]," +
      "[" +
        TransformerSerializer.getOutChannels(transformerDef, transformerIndex, row, rowIndex) +
      "]," +
      "{" +
        transformer.propertyValues.map((propertyVal: Property) => this.propertySerializer.toApama(propertyVal, transformerDef.getProperty(propertyVal.definitionName))).join(",") +
      "}" +
    ")";
  }

  private static getInChannels(transformerDef: TransformerDef, transformerIndex: number, row: Row, rowIndex: number) : string {
    if (!transformerDef.inputChannels.size) {
      return "";
    }
    return "\"" + transformerDef.inputChannels.map((channel, channelIndex: number) => {
      if (transformerIndex === 0) {
        if (row.inputChannelOverrides.getValue().has(channelIndex)) {
          return row.inputChannelOverrides.getValue().get(channelIndex).name.getValue();
        } else {
          return `Row${rowIndex}:Input${channelIndex}`;
        }
      } else {
        return `Row${rowIndex}:Channel${transformerIndex}`
      }
    }).join("\",\"") + "\""
  }

  private static getOutChannels(transformerDef: TransformerDef, transformerIndex: number, row: Row, rowIndex: number) : string {
    if (!transformerDef.outputChannels.size) {
      return "";
    }
    return "\"" + transformerDef.outputChannels.map((channel, channelIndex: number) => {
      if (transformerIndex === row.transformers.getValue().size-1) {
        if (row.outputChannelOverrides.getValue().has(channelIndex)) {
          return row.outputChannelOverrides.getValue().get(channelIndex).name.getValue();
        } else {
          return `Row${rowIndex}:Output${channelIndex}`;
        }
      } else {
        return `Row${rowIndex}:Channel${transformerIndex+1}`
      }
    }).join("\",\"") + "\""
  }
}
