import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AbstractModel} from "./AbstractModel";

export interface TransformerChannelDefJsonInterface {
  name: string;
  description: string;
  repeated?: boolean;
  optional?: boolean;
  prefix?: string;
}

export interface TransformerChannelDefInterface {
  name: string;
  description: string;
  repeated: boolean;
  optional: boolean;
  prefix: string;
}

export class TransformerChannelDef extends AbstractModel<TransformerChannelDefJsonInterface, never> {
  readonly name: string;
  readonly description: string;
  readonly repeated: boolean;
  readonly optional: boolean;
  readonly prefix: string;

  constructor(obj: TransformerChannelDefInterface) {
    super();
    this.name = obj.name;
    this.description = obj.description;
    this.repeated = obj.repeated;
    this.optional = obj.optional;
    this.prefix = obj.prefix;
  }

  validate(): this {
    //TODO: do some validation
    return this;
  }

  hasPrefix(): boolean {
    return this.prefix !== "";
  }
}

export class TransformerChannelDefBuilder extends ClassBuilder<TransformerChannelDef> implements TransformerChannelDefInterface {
  name: string;
  description: string;
  repeated: boolean = false;
  optional: boolean = false;
  prefix: string = "";

  Name(name: string): this {
    this.name = name;
    return this;
  }
  Description(description: string): this {
    this.description = description;
    return this;
  }
  Repeated(repeated: boolean): this {
    this.repeated = repeated;
    return this;
  }
  Optional(optional: boolean): this {
    this.optional = optional;
    return this;
  }
  Prefix(prefix: string): this {
    this.prefix = prefix;
    return this;
  }
  build(): TransformerChannelDef {
    return new TransformerChannelDef(this);
  }
  static fromJson(json: TransformerChannelDefJsonInterface) {
    return Object.assign(new TransformerChannelDefBuilder(), json);
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
