import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {NestedTransformerDefBuilder, TransformerDef} from "./TransformerDef";

export interface MetadataInterface {
  transformers: TransformerDef[]
}

export class Metadata implements MetadataInterface {
  readonly transformers: TransformerDef[] = [];

  constructor(obj: MetadataInterface) {
    this.transformers = obj.transformers;
  }
}

export class MetadataBuilder extends ClassBuilder<Metadata> implements MetadataInterface {
  transformers: TransformerDef[];

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
