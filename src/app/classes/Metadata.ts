import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {NestedTransformerDefBuilder, TransformerDef, TransformerDefJsonInterface, TransformerDefBuilder} from "./TransformerDef";
import {List} from "immutable";
import {AbstractModel} from "./AbstractModel";

export interface MetadataJsonInterface {
  version: string;
  transformers?: TransformerDefJsonInterface[]
}

export interface MetadataInterface {
  version: string
  transformers: TransformerDef[]
}

export class Metadata extends AbstractModel<MetadataJsonInterface> {
  readonly version: string;
  readonly transformers: List<TransformerDef>;

  constructor(obj: MetadataInterface) {
    super();
    this.version = obj.version;
    this.transformers = List(obj.transformers);
  }
}

export class MetadataBuilder extends ClassBuilder<Metadata> implements MetadataInterface {
  version: string = "0.0.0.0";
  transformers: TransformerDef[] = [];

  Version(version: string): this {
    this.version = version;
    return this;
  }
  Transformers(transformers: TransformerDef[]): this {
    this.transformers = transformers;
    return this;
  }
  pushTransformer(...transformer: TransformerDef[]): this {
    this.transformers.push(...transformer);
    return this;
  }
  withTransformer(): NestedTransformerDefBuilder<this> {
    return new NestedTransformerDefBuilder<this>((transformer) => { this.transformers.push(transformer); return this; });
  }

  build(): Metadata {
    return new Metadata(this);
  }

  static fromJson(json: MetadataJsonInterface) {
    return new MetadataBuilder()
      .Version(json.version)
      .Transformers((json.transformers || []).map((transformer) => TransformerDefBuilder.fromJson(transformer).build()))
  }
}

export class NestedMetadataBuilder<Parent> extends MetadataBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (metadata: Metadata) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class MetadataArrayBuilder extends ClassArrayBuilder<Metadata, NestedMetadataBuilder<MetadataArrayBuilder>> {
  constructor() {
    super(NestedMetadataBuilder);
  }
}
