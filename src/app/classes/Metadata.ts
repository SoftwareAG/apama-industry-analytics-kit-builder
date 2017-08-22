import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {NestedTransformerDefBuilder, TransformerDef, TransformerDefJsonInterface, TransformerDefBuilder} from "./TransformerDef";
import {List, OrderedMap} from "immutable";
import {AbstractModel} from "./AbstractModel";
import {Transformer, TransformerBuilder} from "./Transformer";

export interface MetadataJsonInterface {
  version: string;
  groupOrder?: string[];
  samples?: string[];
  analytics?: TransformerDefJsonInterface[]
}

export interface MetadataInterface {
  version: string
  groupOrder: string[],
  samples: string[];
  analytics: TransformerDef[]
}

export class Metadata extends AbstractModel<MetadataJsonInterface, never> {
  readonly version: string;
  readonly groupOrder: List<string>;
  readonly samples: List<string>;
  readonly analyticsByName: OrderedMap<string, TransformerDef>;
  get analytics() { return List(this.analyticsByName.valueSeq()) }

  constructor(obj: MetadataInterface) {
    super();
    this.version = obj.version;
    this.groupOrder = List(obj.groupOrder);
    this.samples = List(obj.samples);
    this.analyticsByName = OrderedMap<string, TransformerDef>((obj.analytics.map(analytic => [analytic.name, analytic])));
  }

  toJson(): MetadataJsonInterface {
    return {
      version: this.version,
      groupOrder: this.groupOrder.toArray(),
      samples: this.samples.toArray(),
      analytics: this.analytics.toArray().map(analytic => analytic.toJson())
    }
  }

  validate(): this {
    return this;
  }

  getAnalytic(name: string): TransformerDef {
      return this.analyticsByName.get(name);
  }

  createAnalytic(name: string): Transformer {
    return TransformerBuilder.fromTransformerDef(this.getAnalytic(name)).build();
  }
}

export class MetadataBuilder extends ClassBuilder<Metadata> implements MetadataInterface {
  version: string = "2.0.0.1";
  groupOrder: string[] = [];
  samples: string[] = [];
  analytics: TransformerDef[] = [];

  Version(version: string): this {
    this.version = version;
    return this;
  }
  GroupOrder(groupOrder: string[]) : this {
    this.groupOrder = groupOrder;
    return this;
  }
  SampleConfigurations(samples: string[]) : this {
    this.samples = samples;
    return this;
  }
  pushGroupOrder(...group: string[]): this {
    this.groupOrder.push(...group);
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
      .GroupOrder(json.groupOrder || [])
      .SampleConfigurations(json.samples || [])
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
