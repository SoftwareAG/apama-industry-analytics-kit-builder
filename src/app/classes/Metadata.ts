import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {NestedTransformerDefBuilder, TransformerDef, TransformerDefJsonInterface, TransformerDefBuilder} from "./TransformerDef";
import {List} from "immutable";
import {AbstractModel} from "./AbstractModel";

export interface MetadataJsonInterface {
  version: string;
  analytics?: TransformerDefJsonInterface[]
}

export interface MetadataInterface {
  version: string
  analytics: TransformerDef[]
}

export class Metadata extends AbstractModel<MetadataJsonInterface> {
  readonly version: string;
  readonly analytics: List<TransformerDef>;

  constructor(obj: MetadataInterface) {
    super();
    this.version = obj.version;
    this.analytics = List(obj.analytics);
  }
}

export class MetadataBuilder extends ClassBuilder<Metadata> implements MetadataInterface {
  version: string = "0.0.0.0";
  analytics: TransformerDef[] = [];

  Version(version: string): this {
    this.version = version;
    return this;
  }
  Analytics(transformers: TransformerDef[]): this {
    this.analytics = transformers;
    return this;
  }
  pushAnalytic(...transformer: TransformerDef[]): this {
    this.analytics.push(...transformer);
    return this;
  }
  withAnalytic(): NestedTransformerDefBuilder<this> {
    return new NestedTransformerDefBuilder<this>((transformer) => { this.analytics.push(transformer); return this; });
  }

  build(): Metadata {
    return new Metadata(this);
  }

  static fromJson(json: MetadataJsonInterface) {
    return new MetadataBuilder()
      .Version(json.version)
      .Analytics((json.analytics || []).map((transformer) => TransformerDefBuilder.fromJson(transformer).build()))
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
