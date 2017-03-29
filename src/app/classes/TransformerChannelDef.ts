import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
export interface TransformerChannelDefInterface {
  name: string;
  description: string;
}

export class TransformerChannelDef {
  readonly name: string;
  readonly description: string;

  constructor(obj: TransformerChannelDefInterface) {
    this.name = obj.name;
    this.description = obj.description;
  }
}

export class TransformerChannelDefBuilder extends ClassBuilder<TransformerChannelDef> implements TransformerChannelDefInterface {
  name: string;
  description: string;

  Name(name: string): this {
    this.name = name;
    return this;
  }
  Description(description: string): this {
    this.description = description;
    return this;
  }
  build(): TransformerChannelDef {
    return new TransformerChannelDef(this);
  }
}

export class NestedTransformerChannelDefBuilder<Parent> extends TransformerChannelDefBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (Channel: TransformerChannelDef) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class TransformerChannelDefArrayBuilder extends ClassArrayBuilder<TransformerChannelDef, NestedTransformerChannelDefBuilder<TransformerChannelDefArrayBuilder>> {
  constructor() {
    super(NestedTransformerChannelDefBuilder);
  }
}
