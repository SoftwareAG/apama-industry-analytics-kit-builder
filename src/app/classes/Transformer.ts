import {NestedPropertyBuilder, ValidProperty} from "./Property";
import {TransformerDef, TransformerDefInterface} from "./TransformerDef";
import {ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {NestedTransformerChannelDefBuilder, TransformerChannelDef} from "app/classes/TransformerChannelDef";

export interface TransformerInterface extends TransformerDefInterface {
  properties: ValidProperty[];
}

export class Transformer extends TransformerDef implements TransformerInterface {
  readonly properties: ValidProperty[];

  constructor(obj: TransformerInterface) {
    super(obj);
    this.properties = obj.properties;
  }
}

export class TransformerBuilder extends ClassBuilder<Transformer> implements TransformerInterface {
  name: string;
  properties: ValidProperty[] = [];
  inputChannels: TransformerChannelDef[] = [];
  outputChannels: TransformerChannelDef[] = [];

  Name(name): this {
    this.name = name;
    return this;
  }
  Properties(properties: ValidProperty[]): this {
    this.properties = properties;
    return this;
  }
  pushProperty(...property: ValidProperty[]): this {
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
}

export class NestedTransformerBuilder<Parent> extends TransformerBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (transformer: Transformer) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}
