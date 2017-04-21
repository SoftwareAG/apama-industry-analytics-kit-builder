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

export interface TransformerInterface {
  name: string;
  properties: Property[];
  inputChannels: TransformerChannelDef[];
  outputChannels: TransformerChannelDef[];
}

export class Transformer extends AbstractModel<TransformerJsonInterface> implements AsObservable, BehaviorSubjectify<TransformerInterface>, AbstractModel<TransformerJsonInterface> {
  readonly name: BehaviorSubject<string>;
  readonly properties: BehaviorSubject<List<Property>>;
  readonly inputChannels: BehaviorSubject<List<TransformerChannelDef>>;
  readonly outputChannels: BehaviorSubject<List<TransformerChannelDef>>;

  constructor(obj: TransformerInterface) {
    super();
    this.name = new BehaviorSubject(obj.name);
    this.properties = new BehaviorSubject(List(obj.properties));
    this.inputChannels = new BehaviorSubject(List(obj.inputChannels));
    this.outputChannels = new BehaviorSubject(List(obj.outputChannels));
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.name,
      this.properties,
      this.inputChannels,
      this.outputChannels,
      this.properties.switchMap(properties => Observable.merge(...properties.map(property => (property as Property).asObservable()).toArray())),
      this.inputChannels.switchMap(inChannels => Observable.merge(...inChannels.toArray().map((inChan: any) => inChan.asObservable ? inChan.asObservable() : new BehaviorSubject(inChan)))),
      this.outputChannels.switchMap(outChannels => Observable.merge(...outChannels.toArray().map((outChan: any) => outChan.asObservable ? outChan.asObservable() : new BehaviorSubject(outChan))))
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

    transformer.name = transformer.name || "";

    return "" +
      (transformer.name ?
        `${namespace}.Analytic("` +
        `${transformer.name}",` +
          "[" +
            TransformerSerializer.getInChannels(transformer, transformerIndex, row, rowIndex) +
          "]," +
          "[" +
            TransformerSerializer.getOutChannels(transformer, transformerIndex, row, rowIndex) +
          "]," +
          "{" +
            (transformer.properties || []).map(this.propertySerializer.toApama) +
          "}" +
        ")"
      : "");
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
