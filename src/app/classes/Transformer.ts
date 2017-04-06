import {NestedPropertyBuilder, Property} from "./Property";
import {TransformerDef, TransformerDefInterface} from "./TransformerDef";
import {ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {NestedTransformerChannelDefBuilder, TransformerChannelDef} from "app/classes/TransformerChannelDef";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {List} from "immutable";
import {BehaviorSubject, Observable} from "rxjs";

export interface TransformerInterface extends TransformerDefInterface {
  properties: Property[];
}

export class Transformer extends TransformerDef implements AsObservable, BehaviorSubjectify<TransformerInterface> {
  readonly properties: BehaviorSubject<List<Property>>;

  constructor(obj: TransformerInterface) {
    super(obj);
    this.properties = new BehaviorSubject(List(obj.properties));
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      super.asObservable(),
      this.properties,
      this.properties.switchMap(properties => Observable.merge(...properties.toArray().map(property => (property as Property).asObservable())))
    ).mapTo(this);
  }
}

export class TransformerBuilder extends ClassBuilder<Transformer> implements TransformerInterface {
  name: string;
  properties: Property[] = [];
  inputChannels: TransformerChannelDef[] = [];
  outputChannels: TransformerChannelDef[] = [];

  Name(name): this {
    this.name = name;
    return this;
  }
  Properties(properties: Property[]): this {
    this.properties = properties;
    return this;
  }
  pushProperty(...property: Property[]): this {
    this.properties.push(...property);
    return this;
  }
  withProperty(): NestedPropertyBuilder<this> {
    return new NestedPropertyBuilder((property) => { this.properties.push(property); return this; })
  }
  InputChannels(inputChannels: TransformerChannelDef[]): this {
    this.inputChannels = inputChannels;
    return this;
  }
  pushInputChannel(...inputChannel: TransformerChannelDef[]): this {
    this.inputChannels.push(...inputChannel);
    return this;
  }
  withInputChannel(): NestedTransformerChannelDefBuilder<this> {
    return new NestedTransformerChannelDefBuilder((channel) => { this.inputChannels.push(channel); return this;});
  }
  OutputChannels(outputChannels: TransformerChannelDef[]): this {
    this.outputChannels = outputChannels;
    return this;
  }
  pushOutputChannel(...outputChannels: TransformerChannelDef[]): this {
    this.outputChannels.push(...outputChannels);
    return this;
  }
  withOutputChannel(): NestedTransformerChannelDefBuilder<this> {
    return new NestedTransformerChannelDefBuilder((channel) => {this.outputChannels.push(channel); return this; });
  }
  build(): Transformer {
    return new Transformer(this);
  }
}

export class NestedTransformerBuilder<Parent> extends TransformerBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (transformer: Transformer) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}
