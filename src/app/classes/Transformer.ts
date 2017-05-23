import {
  NestedPropertyBuilder,
  Property,
  PropertyBuilder,
  PropertyDeserializer,
  PropertyJsonInterface,
  PropertySerializer
} from "./Property";
import {TransformerDef} from "./TransformerDef";
import {ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AsObservable} from "../interfaces/interfaces";
import {List, Map, OrderedMap} from "immutable";
import {BehaviorSubject, Observable} from "rxjs";
import {Row} from "./Row";
import {Injectable} from "@angular/core";
import {PropertyDef} from "./PropertyDef";
import {AbstractModel} from "./AbstractModel";
import {
  NestedTransformerChannelBuilder,
  TransformerChannel,
  TransformerChannelBuilder,
  TransformerChannelDeserializer,
  TransformerChannelJsonInterface
} from "./TransformerChannel";
import {validate} from "validate.js";
import {TransformerChannelDef} from "./TransformerChannelDef";
import {AbstractMetadataService} from "../services/MetadataService";

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
    if (validate.isEmpty(this.name)) { throw new Error('Name cannot be empty'); }
    this.propertyValues.forEach((propertyVal: Property) => {
      if (!transformerDef.propertiesByName.has(propertyVal.definitionName)) { throw new Error(`PropertyDefinition "${propertyVal.definitionName}" does not exist so propertyValue shouldn't exist`); }
    });

    transformerDef.propertiesByName.forEach((propertyDef: PropertyDef) => {
      const propertyVals = this.getPropertyValues(propertyDef.name);
      if (propertyDef.repeated) {

      } else if (propertyDef.optional) {
        if (propertyVals.size > 1) { throw new Error(`Transformer ${transformerDef.name}\n\nOptional property :[${propertyDef.name}] cannot have more than 1 value, there were: ${propertyVals.size}`)}
      } else {
        if (propertyVals.size !== 1) { throw new Error(`Transformer ${transformerDef.name}\n\nNon-optional property :[${propertyDef.name}] must have exactly one value, there were: ${propertyVals.size}`)}
      }
    });

    this.inputChannels.forEach((channel: TransformerChannel) => {
      if (!transformerDef.inputChannelsByName.has(channel.name)) { throw new Error(`Channel "${channel.name}" does not exist so channel shouldn't exist`); }
    });

    transformerDef.inputChannelsByName.forEach((channelDef: TransformerChannelDef) => {
      const channels = this.getInputChannels(channelDef.name);
      if (channelDef.repeated) {

      } else if (channelDef.optional) {
        if (channels.size > 1) { throw new Error(`Transformer ${transformerDef.name}\n\nOptional channel :[${channelDef.name}] cannot have more than 1 value, there were: ${channels.size}`)}
      } else {
        if (channels.size !== 1) { throw new Error(`Transformer ${transformerDef.name}\n\nNon-optional channel :[${channelDef.name}] must have exactly one value, there were: ${channels.size}`)}
      }
    });

    this.outputChannels.forEach((channel: TransformerChannel) => {
      if (!transformerDef.outputChannelsByName.has(channel.name)) { throw new Error(`Channel "${channel.name}" does not exist so channel shouldn't exist`); }
    });

    transformerDef.outputChannelsByName.forEach((channelDef: TransformerChannelDef) => {
      const channels = this.getOutputChannels(channelDef.name);
      if (channelDef.repeated) {

      } else if (channelDef.optional) {
        if (channels.size > 1) { throw new Error(`Transformer ${transformerDef.name}\n\nOptional channel :[${channelDef.name}] cannot have more than 1 value, there were: ${channels.size}`)}
      } else {
        if (channels.size !== 1) { throw new Error(`Transformer ${transformerDef.name}\n\nNon-optional channel :[${channelDef.name}] must have exactly one value, there were: ${channels.size}`)}
      }
    });
    return this;
  }

  getPropertyValues(name: string): List<Property> {
    return this.propertyValuesByDefName.getValue().get(name) || List();
  }

  addPropertyValue(propertyName: string, propertyValue: Property): this {
    this.propertyValuesByDefName.next(
      this.propertyValuesByDefName.getValue()
        .update(
          propertyName,
          (propertyVals) => propertyVals ? propertyVals.push(propertyValue) : List.of(propertyValue)
        )
    );
    return this;
  }

  removePropertyValue(propertyVal: Property): this {
    this.propertyValuesByDefName.next(
      this.propertyValuesByDefName.getValue().update(
        propertyVal.definitionName,
        (propertyVals) => List<Property>(propertyVals.filter(p => p !== propertyVal))
      )
    );
    return this;
  }

  getInputChannels(name: string): List<TransformerChannel> {
    return this.inputChannelsByDefName.getValue().get(name) || List()
  }

  addInputChannel(channel: TransformerChannel): this {
    this.inputChannelsByDefName.next(
      this.inputChannelsByDefName.getValue()
        .update(
          channel.name,
          (channels) => channels ? channels.push(channel) : List.of(channel)
        )
    );
    return this;
  }

  addInputChannelFromDef(channelDef: TransformerChannelDef) {
    this.addInputChannel(TransformerChannelBuilder.fromTransformerChannelDef(channelDef).build())
  }

  removeInputChannel(channel: TransformerChannel) {
    this.inputChannelsByDefName.next(
      this.inputChannelsByDefName.getValue().update(
        channel.name,
        (channels) => List<TransformerChannel>(channels.filter(p => p !== channel))
      )
    );
    return this;
  }

  getOutputChannels(name: string): List<TransformerChannel> {
    return this.outputChannelsByDefName.getValue().get(name) || List()
  }

  addOutputChannel(channel: TransformerChannel): this {
    this.outputChannelsByDefName.next(
      this.outputChannelsByDefName.getValue()
        .update(
          channel.name,
          (channels) => channels ? channels.push(channel) : List.of(channel)
        )
    );
    return this;
  }

  addOutputChannelFromDef(channelDef: TransformerChannelDef) {
    this.addOutputChannel(TransformerChannelBuilder.fromTransformerChannelDef(channelDef).build())
  }

  removeOutputChannel(channel: TransformerChannel) {
    this.outputChannelsByDefName.next(
      this.outputChannelsByDefName.getValue().update(
        channel.name,
        (channels) => List<TransformerChannel>(channels.filter(p => p !== channel))
      )
    );
    return this;
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
  pushPropertyValue(...properties: Property[]): this {
    properties.forEach( property => {
      const idx = this.propertyValues.findIndex(existingProperty => existingProperty.name.getValue() === property.name.getValue());
      if (idx >=0) {
        this.propertyValues[idx] = property;
      } else {
        this.propertyValues.push(property);
      }
    });
    return this;
  }
  withPropertyValue(): NestedPropertyBuilder<this> {
    return new NestedPropertyBuilder(property => { this.pushPropertyValue(property); return this; })
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
    return new NestedTransformerChannelBuilder(channel => { this.pushInputChannel(channel); return this; })
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
    return new NestedTransformerChannelBuilder(channel => { this.pushOutputChannel(channel); return this; })
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

  toApama(transformer: Transformer, transformerDef: TransformerDef, transformerIndex: number, row: Row, rowIndex: number): string {
    const namespace  = 'com.industry.analytics';

    transformer.validate(transformerDef);

    return `${namespace}.Analytic(` +
      `"${transformer.name}",` +
      "[" +
        TransformerSerializer.getInChannels(transformerDef, transformer, transformerIndex, row, rowIndex) +
      "]," +
      "[" +
        TransformerSerializer.getOutChannels(transformerDef, transformer, transformerIndex, row, rowIndex) +
      "]," +
      "{" +
        transformer.propertyValues.map((propertyVal: Property) => this.propertySerializer.toApama(propertyVal, transformerDef.getProperty(propertyVal.definitionName))).join(",") +
      "}" +
    ")";
  }

  private static getInChannels(transformerDef: TransformerDef, transformer: Transformer, transformerIndex: number, row: Row, rowIndex: number) : string {
    if (!transformer.inputChannels.size) {
      return "";
    }
    return "\"" + transformer.inputChannels.map((channel: TransformerChannel, channelIndex: number) => {
      const channelDef = transformerDef.getInputChannel(channel.name);
      if (transformerIndex === 0) {
        if (row.inputChannelOverrides.getValue().has(channelIndex)) {
          return channelDef.prefix + row.inputChannelOverrides.getValue().get(channelIndex).name.getValue();
        } else {
          return `${channelDef.prefix}Row${rowIndex}:Input${channelIndex}`;
        }
      } else {
        return `${channelDef.prefix}Row${rowIndex}:Channel${transformerIndex}.${channelIndex}`
      }
    }).join("\",\"") + "\""
  }

  private static getOutChannels(transformerDef: TransformerDef, transformer: Transformer, transformerIndex: number, row: Row, rowIndex: number) : string {
    if (!transformer.outputChannels.size) {
      return "";
    }
    return "\"" + transformer.outputChannels.map((channel: TransformerChannel, channelIndex: number) => {
      const channelDef = transformerDef.getOutputChannel(channel.name);
      if (transformerIndex === row.transformers.getValue().size-1) {
        if (row.outputChannelOverrides.getValue().has(channelIndex)) {
          return channelDef.prefix + row.outputChannelOverrides.getValue().get(channelIndex).name.getValue();
        } else {
          return `${channelDef.prefix}Row${rowIndex}:Output${channelIndex}`;
        }
      } else {
        return `${channelDef.prefix}Row${rowIndex}:Channel${transformerIndex+1}.${channelIndex}`
      }
    }).join("\",\"") + "\""
  }
}

@Injectable()
export class TransformerDeserializer {
  readonly analyticPattern = /^\s*com.industry.analytics.Analytic\s*\(\s*"([^"]*)"\s*,\s*(\[[^\]]*])\s*,\s*(\[[^\]]*])\s*,\s*({[^}]*})\s*\)\s*$/;

  constructor(private readonly metadataService: AbstractMetadataService, private readonly propertyDeserializer: PropertyDeserializer, private readonly channelDeserializer: TransformerChannelDeserializer) {}

  applyRepeatedPrefixRule(channelNames: List<string>, transformerChannelDefs: List<TransformerChannelDef>): {remaining: List<string>, matched: OrderedMap<TransformerChannelDef, List<string>>, unprefixedChannels: List<TransformerChannelDef>} {
    return transformerChannelDefs.reduce((result: {remaining: List<string>, matched: OrderedMap<TransformerChannelDef, List<string>>, unprefixedChannels: List<TransformerChannelDef>}, transformerChannelDef: TransformerChannelDef) => {
      if (transformerChannelDef.hasPrefix()) {
        const filteredForPrefix = result.remaining.reduce((remainingAndRemovedChannelsNames: {remaining: List<string>, removed: List<string>}, channelName: string, i: number) => {
          if (channelName.startsWith(transformerChannelDef.prefix)) {
            return {
              remaining: remainingAndRemovedChannelsNames.remaining.remove(i - remainingAndRemovedChannelsNames.removed.size),
              removed: remainingAndRemovedChannelsNames.removed.push(channelName.substr(transformerChannelDef.prefix.length))
            }
          } else {
            return remainingAndRemovedChannelsNames;
          }
        }, {remaining: result.remaining, removed: List<string>()});
        return {
          remaining: filteredForPrefix.remaining,
          matched: result.matched.set(transformerChannelDef, filteredForPrefix.removed),
          unprefixedChannels: result.unprefixedChannels
        };
      } else {
        return {
          remaining: result.remaining,
          matched: result.matched,
          unprefixedChannels: result.unprefixedChannels.push(transformerChannelDef)
        }
      }
    }, {
      remaining: channelNames,
      matched: OrderedMap<TransformerChannelDef, List<string>>(),
      unprefixedChannels: List<TransformerChannelDef>()
    });
  }

  applyChannelRules(channelNames: List<string>, transformerChannelDefs: List<TransformerChannelDef>): OrderedMap<TransformerChannelDef, List<string>> {
    const remainingAndMatched = this.applyRepeatedPrefixRule(channelNames, transformerChannelDefs);
    const prefixed = remainingAndMatched.matched;

    const channelCounts = this.createChannelCounts(remainingAndMatched.unprefixedChannels, remainingAndMatched.remaining);
    const allOtherChannels = this.channelCountToChannelAndName(transformerChannelDefs, channelCounts, remainingAndMatched.remaining);

    const unorderedChannelMapping = prefixed.concat(allOtherChannels) as Map<TransformerChannelDef, List<string>>;

    // Sort the result by the order in the transformerDef
    return transformerChannelDefs.reduce((result: OrderedMap<TransformerChannelDef, List<string>>, channelDef: TransformerChannelDef) => {
      return result.set(channelDef, unorderedChannelMapping.get(channelDef, List<string>()));
    }, OrderedMap<TransformerChannelDef, List<string>>());
  }

  createChannelCounts(transformerChannelDefs: List<TransformerChannelDef>, channels: List<string>): Map<TransformerChannelDef, number> {
    const resultAfterRemovingNonOptional = transformerChannelDefs.reduce((result: {remainingCount: number, remainingChannelDefs: List<TransformerChannelDef>, channelCount: Map<TransformerChannelDef, number>}, channelDef: TransformerChannelDef) => {
      if (channelDef.optional || channelDef.repeated) {
        return result;
      } else {
        return {
          remainingCount: result.remainingCount - 1,
          remainingChannelDefs: result.remainingChannelDefs.filter(remainingChannelDef => remainingChannelDef !== channelDef),
          channelCount: result.channelCount.set(channelDef, 1)
        };
      }
    }, {
      remainingCount: channels.size,
      remainingChannelDefs: transformerChannelDefs,
      channelCount: Map<TransformerChannelDef, number>()
    });

    const finalResult = resultAfterRemovingNonOptional.remainingChannelDefs.reduce((result: {remainingCount: number, remainingChannelDefs: List<TransformerChannelDef>, channelCount: Map<TransformerChannelDef, number>}, channelDef: TransformerChannelDef) => {
      if (result.remainingCount === 0) {
        return result;
      }
      if (channelDef.optional) {
        return {
          remainingCount: result.remainingCount - 1,
          remainingChannelDefs: result.remainingChannelDefs.filter(remainingChannelDef => remainingChannelDef !== channelDef),
          channelCount: result.channelCount.set(channelDef, 1)
        };
      } else if (channelDef.repeated) {
        return {
          remainingCount: 0,
          remainingChannelDefs: result.remainingChannelDefs.filter(remainingChannelDef => remainingChannelDef !== channelDef),
          channelCount: result.channelCount.set(channelDef, result.remainingCount)
        };
      }
      return result;
    }, resultAfterRemovingNonOptional);

    return finalResult.channelCount;
  }

  channelCountToChannelAndName(transformerChannelDef: List<TransformerChannelDef>, channelCounts: Map<TransformerChannelDef, number>, channelNames: List<string>): OrderedMap<TransformerChannelDef, List<string>> {
    return transformerChannelDef.reduce((result: {remainingChannelNames: List<string>, channelDefToNames: OrderedMap<TransformerChannelDef, List<string>>}, channelDef: TransformerChannelDef) => {
      if (channelCounts.has(channelDef)) {
        const count = channelCounts.get(channelDef);
        return {
          remainingChannelNames: result.remainingChannelNames.skip(count),
          channelDefToNames: result.channelDefToNames.set(channelDef, result.remainingChannelNames.take(count) as List<string>)
        };
      } else {
        return result;
      }
    }, {
      remainingChannelNames: channelNames,
      channelDefToNames: OrderedMap<TransformerChannelDef, List<string>>()
    })
      .channelDefToNames;
  }

  buildAnalytic(analyticLine: string): {analytic: Transformer, inChannels: Map<number, string>, outChannels: Map<number, string>} {
    const analyticMatch = analyticLine.match(this.analyticPattern);
    if (analyticMatch && analyticMatch.length) {
      const [, analyticName, analyticInChannels, analyticOutChannels, analyticProperties] = analyticMatch;
      const transformerDef: TransformerDef = this.metadataService.getAnalytic(analyticName);
      if (transformerDef) {
        const transformerBuilder = new TransformerBuilder()
          .Name(transformerDef.name)
          .PropertyValues(
            transformerDef.properties.toArray()
              .filter(propertyDef => !propertyDef.optional && !propertyDef.repeated)
              .map(propertyDef => PropertyBuilder.fromPropertyDef(propertyDef).build())
          );

        // Channels
        const inChannelNames = this.channelDeserializer.buildChannels(analyticInChannels);
        const outChannelNames = this.channelDeserializer.buildChannels(analyticOutChannels);

        const inputChannelMappings = this.applyChannelRules(inChannelNames, transformerDef.inputChannels);
        const outputChannelMappings = this.applyChannelRules(outChannelNames, transformerDef.outputChannels);

        inputChannelMappings.forEach((channelNames: List<string>, channelDef: TransformerChannelDef) => transformerBuilder.pushInputChannel(...channelNames.toArray().map(channelName => TransformerChannelBuilder.fromTransformerChannelDef(channelDef).build())));
        outputChannelMappings.forEach((channelNames: List<string>, channelDef: TransformerChannelDef) => transformerBuilder.pushOutputChannel(...channelNames.toArray().map(channelName => TransformerChannelBuilder.fromTransformerChannelDef(channelDef).build())));

        const unPrefixedInChannelNames = inputChannelMappings.valueSeq().flatMap((channelNames: List<string>) => channelNames);
        const unPrefixedOutChannelNames = inputChannelMappings.valueSeq().flatMap((channelNames: List<string>) => channelNames);

        // Create the Row Channel Overrides
        const inChanNamesAndIndexes = unPrefixedInChannelNames.reduce((result: Map<number, string>, chanName: string, i: number) => {
          if (!chanName.startsWith("Row")) {
            return result.set(i, chanName);
          }
          return result;
        }, Map<number, string>());
        const outChanNamesAndIndexes = unPrefixedOutChannelNames.reduce((result: Map<number, string>, chanName: string, i: number) => {
          if (!chanName.startsWith("Row")) {
            return result.set(i, chanName);
          }
          return result;
        }, Map<number, string>());

        // Properties
        transformerBuilder.pushPropertyValue(...this.propertyDeserializer.buildProperties(transformerDef, analyticProperties));
        return {analytic: transformerBuilder.build().validate(transformerDef), inChannels: inChanNamesAndIndexes, outChannels: outChanNamesAndIndexes};
      } else {
        throw new Error(`Analytic '${analyticName}' not found in definitions`);
      }
    } else {
      throw new Error(`Not a valid analytic: ${analyticLine}`)
    }
  }
}
