import {NestedTransformerBuilder, Transformer} from "./Transformer";
import {Channel, NestedChannelBuilder} from "./Channel";
import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {TransformerChannelDef} from "./TransformerChannelDef";

export interface RowInterface {
  maxTransformerCount: number;
  transformers : Transformer[];
  inputChannelOverrides: (Channel | undefined)[];
  outputChannelOverrides: (Channel | undefined)[];
}

export class Row implements RowInterface {
  readonly maxTransformerCount: number;
  transformers : Transformer[];
  inputChannelOverrides: (Channel | undefined)[];
  outputChannelOverrides: (Channel | undefined)[];

  constructor(obj: RowInterface) {
    this.maxTransformerCount = obj.maxTransformerCount;
    this.transformers = obj.transformers;
    this.inputChannelOverrides = obj.inputChannelOverrides;
    this.outputChannelOverrides = obj.outputChannelOverrides;
  }

  getInChannels(): (Channel | TransformerChannelDef)[] {
    // Must have the same number of input channels as the first transformer
    const requiredChannels = this.transformers.length ? this.transformers[0].inputChannels : [];
    // If the row contains an override then return that otherwise return the Default ChannelDef from the first transformer
    return requiredChannels.map((channelDef, i) => { return this.inputChannelOverrides.length > i && this.inputChannelOverrides[i] || channelDef; });
  }

  getOutChannels(): (Channel | TransformerChannelDef)[] {
    // Must have the same number of output channels as the last transformer
    const requiredChannels = this.transformers.length ? this.transformers[this.transformers.length - 1].outputChannels : [];
    // If the row contains an override then return that otherwise return the Default ChannelDef from the last transformer
    return requiredChannels.map((channelDef, i) => { return this.outputChannelOverrides.length > i && this.outputChannelOverrides[i] || channelDef; });
  }
}

export class RowBuilder extends ClassBuilder<Row> implements RowInterface {
  maxTransformerCount: number;
  transformers: Transformer[] = [];
  inputChannelOverrides: (Channel | undefined)[] = [];
  outputChannelOverrides: (Channel | undefined)[] = [];

  MaxTransformerCount(maxTransformerCount: number): this {
    this.maxTransformerCount = maxTransformerCount;
    return this;
  }

  Transformers(transformers: Transformer[]): this {
    this.transformers = transformers;
    return this;
  }
  pushTransformer(...transformer: Transformer[]): this {
    this.transformers.push(...transformer);
    return this;
  }
  withTransformer(): NestedTransformerBuilder<this> {
    return new NestedTransformerBuilder<this>((transformer) => { this.transformers.push(transformer); return this; });
  }

  InputChannel(inputChannelOverrides: Channel[]): this {
    this.inputChannelOverrides = inputChannelOverrides;
    return this;
  }
  pushInputChannel(...inputChannelOverride: (Channel | undefined)[]): this {
    this.inputChannelOverrides.push(...inputChannelOverride);
    return this;
  }
  withInputChannel(): NestedChannelBuilder<this> {
    return new NestedChannelBuilder((channel) => {this.inputChannelOverrides.push(channel); return this;})
  }

  OutputChannel(outputChannelOverrides: (Channel | undefined)[]): this {
    this.outputChannelOverrides = outputChannelOverrides;
    return this;
  }
  pushOutputChannel(...outputChannelOverride: (Channel | undefined)[]): this {
    this.outputChannelOverrides.push(...outputChannelOverride);
    return this;
  }
  withOutputChannel(): NestedChannelBuilder<this> {
    return new NestedChannelBuilder((channel) => {this.outputChannelOverrides.push(channel); return this;})
  }

  build(): Row {
    return new Row(this);
  }
}

export class NestedRowBuilder<Parent> extends RowBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (row: Row) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class RowArrayBuilder extends ClassArrayBuilder<Row, NestedRowBuilder<RowArrayBuilder>> {
  constructor() {
    super(NestedRowBuilder);
  }
}

