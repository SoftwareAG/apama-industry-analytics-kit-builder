import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AbstractModel} from "./AbstractModel";
import {List} from "immutable";

export interface TransformerChannelDefJsonInterface {
  name: string;
  description: string;
  repeated?: boolean;
  optional?: boolean;
  prefix?: string;
  dataProperties?: Array<string>;
}

export interface TransformerChannelDefInterface {
  name: string;
  description: string;
  repeated: boolean;
  optional: boolean;
  prefix: string;
  dataProperties: List<string>;
}

export class TransformerChannelDef extends AbstractModel<TransformerChannelDefJsonInterface, never> {
  readonly name: string;
  readonly description: string;
  readonly repeated: boolean;
  readonly optional: boolean;
  readonly prefix: string;
  readonly dataProperties: List<string>;
  readonly type: "string" | "boolean" | "number" | undefined;

  constructor(obj: TransformerChannelDefJsonInterface) {
    super();
    this.name = obj.name;
    this.description = obj.description;
    this.repeated = !!obj.repeated;
    this.optional = !!obj.optional;
    this.prefix = obj.prefix || "";
    this.dataProperties = List(obj.dataProperties || []);
  }

  validate(): this {
    //TODO: do some validation
    return this;
  }

  hasPrefix(): boolean {
    return this.prefix !== "";
  }
}

export class TransformerChannelDefBuilder extends ClassBuilder<TransformerChannelDef> implements TransformerChannelDefJsonInterface {
  name: string;
  description: string;
  repeated: boolean = false;
  optional: boolean = false;
  prefix: string = "";
  dataProperties: Array<string> = [];

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
  DataProperties(dataProperties: Array<string>): this {
    this.dataProperties.concat(dataProperties);
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
