import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {NestedTransformerDefBuilder, TransformerDef, TransformerDefJsonInterface, TransformerDefBuilder} from "./TransformerDef";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {List} from "immutable";
import {AbstractModel} from "./AbstractModel";

export interface MetadataJsonInterface {
  transformers: TransformerDefJsonInterface[]
}

export interface MetadataInterface {
  transformers: TransformerDef[]
}

export class Metadata extends AbstractModel<MetadataJsonInterface> implements AsObservable, BehaviorSubjectify<MetadataInterface> {
  readonly transformers: BehaviorSubject<List<TransformerDef>>;

  constructor(obj: MetadataInterface) {
    super();
    this.transformers = new BehaviorSubject(List(obj.transformers));
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.transformers,
      this.transformers.switchMap(transformers => Observable.merge(...transformers.toArray().map(transformer => transformer.asObservable())))
    ).mapTo(this);
  }
}

export class MetadataBuilder extends ClassBuilder<Metadata> implements MetadataInterface {
  transformers: TransformerDef[] = [];

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
      .Transformers(json.transformers.map((transformer) => TransformerDefBuilder.fromJson(transformer).build()))
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
