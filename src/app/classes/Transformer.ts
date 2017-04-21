import {NestedPropertyBuilder, Property, PropertyBuilder, PropertyJsonInterface, PropertySerializer} from "./Property";
import {
  TransformerDef,
  TransformerDefBuilder,
  TransformerDefInterface,
  TransformerDefJsonInterface
} from "./TransformerDef";
import {ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {NestedTransformerChannelDefBuilder, TransformerChannelDef} from "app/classes/TransformerChannelDef";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {List} from "immutable";
import {BehaviorSubject, Observable} from "rxjs";
import {AbstractModel} from "./AbstractModel";
import {RowJsonInterface} from "./Row";
import {Injectable} from "@angular/core";

export interface TransformerJsonInterface extends TransformerDefJsonInterface {
  name: string;
  properties?: PropertyJsonInterface[]
}

interface ModifiableTransformerInterface {
  properties: Property[];
}

interface UnmodifiableTransformerInterface {
  name: string;
  inputChannels: TransformerChannelDef[];
  outputChannels: TransformerChannelDef[];
}

export interface TransformerInterface extends ModifiableTransformerInterface, UnmodifiableTransformerInterface {}

export class Transformer extends AbstractModel<TransformerJsonInterface> implements AsObservable, BehaviorSubjectify<ModifiableTransformerInterface> {
  readonly name: string;
  readonly properties: BehaviorSubject<List<Property>>;
  readonly inputChannels: List<TransformerChannelDef>;
  readonly outputChannels: List<TransformerChannelDef>;

  constructor(obj: TransformerInterface) {
    super();
    this.name = obj.name;
    this.properties = new BehaviorSubject(List(obj.properties));
    this.inputChannels = List(obj.inputChannels);
    this.outputChannels = List(obj.outputChannels);
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.properties,
      this.properties.switchMap(properties => Observable.merge(...properties.map(property => (property as Property).asObservable()).toArray()))
    ).mapTo(this);
  }
}

export class TransformerBuilder extends ClassBuilder<Transformer> implements TransformerInterface {
  name: string;
  properties: Property[] = [];
  inputChannels: TransformerChannelDef[] = [];
  outputChannels: TransformerChannelDef[] = [];

  Name(name): this {
    this.name = name;
    return this;
  }
  Properties(properties: Property[]): this {
    this.properties = properties;
    return this;
  }
  pushProperty(...property: Property[]): this {
    this.properties.push(...property);
    return this;
  }
  withProperty(): NestedPropertyBuilder<this> {
    return new NestedPropertyBuilder((property) => { this.properties.push(property); return this; })
  }
  InputChannels(inputChannels: TransformerChannelDef[]): this {
    this.inputChannels = inputChannels;
    return this;
  }
  pushInputChannel(...inputChannel: TransformerChannelDef[]): this {
    this.inputChannels.push(...inputChannel);
    return this;
  }
  withInputChannel(): NestedTransformerChannelDefBuilder<this> {
    return new NestedTransformerChannelDefBuilder((channel) => { this.inputChannels.push(channel); return this;});
  }
  OutputChannels(outputChannels: TransformerChannelDef[]): this {
    this.outputChannels = outputChannels;
    return this;
  }
  pushOutputChannel(...outputChannels: TransformerChannelDef[]): this {
    this.outputChannels.push(...outputChannels);
    return this;
  }
  withOutputChannel(): NestedTransformerChannelDefBuilder<this> {
    return new NestedTransformerChannelDefBuilder((channel) => {this.outputChannels.push(channel); return this; });
  }
  build(): Transformer {
    return new Transformer(this);
  }

  static fromTransformerDefBuilder(transformerDefBuilder: TransformerDefBuilder): TransformerBuilder {
    return new TransformerBuilder()
      .Name(transformerDefBuilder.name)
      .Properties(transformerDefBuilder.properties.map((propDef) => PropertyBuilder.fromJson(propDef.toJson()).build()))
      .InputChannels(transformerDefBuilder.inputChannels)
      .OutputChannels(transformerDefBuilder.outputChannels);
  }

  static fromJson(json: TransformerJsonInterface): TransformerBuilder {
    return this.fromTransformerDefBuilder(TransformerDefBuilder.fromJson(json));
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
        (transformer.properties || []).map(property => this.propertySerializer.toApama(property)) +
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
