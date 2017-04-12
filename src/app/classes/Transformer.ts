import {NestedPropertyBuilder, Property, PropertyBuilder, PropertyJsonInterface} from "./Property";
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

export interface TransformerJsonInterface extends TransformerDefJsonInterface {
  name: string;
  properties: PropertyJsonInterface[]
}

export interface TransformerInterface extends TransformerDefInterface  {
  properties: Property[];
}

export class Transformer extends TransformerDef implements AsObservable, BehaviorSubjectify<TransformerInterface>, AbstractModel<TransformerJsonInterface> {
  readonly properties: BehaviorSubject<List<Property>>;

  constructor(obj: TransformerInterface) {
    super(obj);
    this.properties = new BehaviorSubject(List(obj.properties));
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      super.asObservable(),
      this.properties,
      this.properties.switchMap(properties => Observable.merge(...properties.toArray().map(property => (property as Property).asObservable())))
    ).mapTo(this);
  }

  toJson(): TransformerJsonInterface {
    return super.toJson() as TransformerJsonInterface;
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
