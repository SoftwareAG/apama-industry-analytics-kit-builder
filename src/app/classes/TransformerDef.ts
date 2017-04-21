import {NestedPropertyDefBuilder, PropertyDef, PropertyDefBuilder, PropertyDefJsonInterface} from "./PropertyDef";
import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {
  NestedTransformerChannelDefBuilder,
  TransformerChannelDef,
  TransformerChannelDefBuilder,
  TransformerChannelDefJsonInterface
} from "./TransformerChannelDef";
import {List} from "immutable";
import {AbstractModel} from "./AbstractModel";

export interface TransformerDefJsonInterface {
  name: string;
  properties?: PropertyDefJsonInterface[];
  inputChannels?: TransformerChannelDefJsonInterface[];
  outputChannels?: TransformerChannelDefJsonInterface[];
}

export interface TransformerDefInterface {
  name: string;
  properties: PropertyDef[];
  inputChannels: TransformerChannelDef[];
  outputChannels: TransformerChannelDef[];
}

export class TransformerDef extends AbstractModel<TransformerDefJsonInterface> {
  readonly name: string;
  readonly properties: List<PropertyDef>;
  readonly inputChannels: List<TransformerChannelDef>;
  readonly outputChannels: List<TransformerChannelDef>;

  constructor(obj: TransformerDefInterface) {
    super();
    this.name = obj.name;
    this.properties = List(obj.properties);
    this.inputChannels = List(obj.inputChannels);
    this.outputChannels = List(obj.outputChannels);
  }
}

export class TransformerDefBuilder extends ClassBuilder<TransformerDef> implements TransformerDefInterface {
  name: string;
  properties: PropertyDef[] = [];
  inputChannels: TransformerChannelDef[] = [];
  outputChannels: TransformerChannelDef[] = [];

  Name(name): this {
    this.name = name;
    return this;
  }
  Properties(properties: PropertyDef[]): this {
    this.properties = properties;
    return this;
  }
  pushProperty(...property: PropertyDef[]): this {
    this.properties.push(...property);
    return this;
  }
  withProperty(): NestedPropertyDefBuilder<this> {
    return new NestedPropertyDefBuilder((property) => { this.properties.push(property); return this; });
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
    return new NestedTransformerChannelDefBuilder((channel) => {this.inputChannels.push(channel); return this; });
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
  build(): TransformerDef {
    return new TransformerDef(this);
  }

  static fromJson(json: TransformerDefJsonInterface): TransformerDefBuilder {
    return new TransformerDefBuilder()
      .Name(json.name)
      .Properties((json.properties || []).map((prop) => PropertyDefBuilder.fromJson(prop).build()))
      .InputChannels((json.inputChannels || []).map((inChan) => TransformerChannelDefBuilder.fromJson(inChan).build()))
      .OutputChannels((json.outputChannels || []).map((outChan) => TransformerChannelDefBuilder.fromJson(outChan).build()))
  }
}

export class NestedTransformerDefBuilder<Parent> extends TransformerDefBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (transformerDef: TransformerDef) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class TransformerDefArrayBuilder extends ClassArrayBuilder<TransformerDef, NestedTransformerDefBuilder<TransformerDefArrayBuilder>> {
  constructor() {
    super(NestedTransformerDefBuilder);
  }
}
