import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {AbstractModel} from "./AbstractModel";

export interface TransformerChannelDefJsonInterface {
  name: string;
  description: string;
}

export interface TransformerChannelDefInterface {
  name: string;
  description: string;
}

export class TransformerChannelDef extends AbstractModel<TransformerChannelDefJsonInterface> implements AsObservable, BehaviorSubjectify<TransformerChannelDefInterface> {
  readonly name: BehaviorSubject<string>;
  readonly description: BehaviorSubject<string>;

  constructor(obj: TransformerChannelDefInterface) {
    super();
    this.name = new BehaviorSubject(obj.name);
    this.description = new BehaviorSubject(obj.description);
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.name,
      this.description
    ).mapTo(this);
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

  static fromJson(json: TransformerChannelDefJsonInterface) {
    return new TransformerChannelDefBuilder()
      .Name(json.name)
      .Description(json.description);
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
