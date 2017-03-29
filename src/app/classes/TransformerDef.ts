import {NestedPropertyDefBuilder, PropertyDef} from "./PropertyDef";
import {ClassBuilder, ClassArrayBuilder, NestedClassBuilder} from "./ClassBuilder";
import {NestedTransformerChannelDefBuilder, TransformerChannelDef} from "./TransformerChannelDef";

export interface TransformerDefInterface {
  name: string;
  properties: PropertyDef[];
  inputChannels: TransformerChannelDef[];
  outputChannels: TransformerChannelDef[];
}

export class TransformerDef implements TransformerDefInterface {
  readonly name: string;
  readonly properties: PropertyDef[];
  readonly inputChannels: TransformerChannelDef[];
  readonly outputChannels: TransformerChannelDef[];

  constructor(obj: TransformerDefInterface) {
    this.name = obj.name;
    this.properties = obj.properties;
    this.inputChannels = obj.inputChannels;
    this.outputChannels = obj.outputChannels;
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
