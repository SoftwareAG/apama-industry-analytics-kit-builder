import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AbstractModel} from "./AbstractModel";
import {TransformerChannelDef} from "./TransformerChannelDef";
import {List} from "immutable";

export interface TransformerChannelJsonInterface {
  name: string;
}

export interface TransformerChannelInterface {
  name: string;
}

export class TransformerChannel extends AbstractModel<TransformerChannelJsonInterface, TransformerChannelDef> {
  readonly name: string;

  constructor(obj: TransformerChannelInterface) {
    super();
    this.name = obj.name;
  }

  validate(transformerChanDef: TransformerChannelDef): this {
    if(this.name !== transformerChanDef.name) { throw new Error(`Name [${this.name}] must match definition name [${transformerChanDef.name}]`) }
    return this;
  }
}

export class TransformerChannelBuilder extends ClassBuilder<TransformerChannel> implements TransformerChannelInterface {
  name: string;

  Name(name: string): this {
    this.name = name;
    return this;
  }
  build(): TransformerChannel {
    return new TransformerChannel(this);
  }
  static fromJson(json: TransformerChannelJsonInterface) {
    return Object.assign(new TransformerChannelBuilder(), json);
  }
  static fromTransformerChannelDef(transformerChannelDef: TransformerChannelDef): TransformerChannelBuilder {
    return new TransformerChannelBuilder()
      .Name(transformerChannelDef.name);
  }
}

export class TransformerChannelDeserializer {
  buildChannels(analyticChannels: string) : List<string> {
    const channelsPattern = /"([^"]*)"/g;
    return List(Array.from(analyticChannels.match(channelsPattern) || [])
      .map(c => c.replace(/"/g, '')))
  }
}

export class NestedTransformerChannelBuilder<Parent> extends TransformerChannelBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (Channel: TransformerChannel) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class TransformerChannelArrayBuilder extends ClassArrayBuilder<TransformerChannel, NestedTransformerChannelBuilder<TransformerChannelArrayBuilder>> {
  constructor() {
    super(NestedTransformerChannelBuilder);
  }
}
