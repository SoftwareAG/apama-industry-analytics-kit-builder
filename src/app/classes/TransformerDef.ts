import {NestedPropertyDefBuilder, PropertyDef} from "./PropertyDef";
import {ClassBuilder, ClassArrayBuilder, NestedClassBuilder} from "./ClassBuilder";
import {NestedTransformerChannelDefBuilder, TransformerChannelDef} from "./TransformerChannelDef";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {List} from "immutable";

export interface TransformerDefInterface {
  name: string;
  properties: PropertyDef[];
  inputChannels: TransformerChannelDef[];
  outputChannels: TransformerChannelDef[];
}

export class TransformerDef implements AsObservable, BehaviorSubjectify<TransformerDefInterface> {
  readonly name: BehaviorSubject<string>;
  readonly properties: BehaviorSubject<List<PropertyDef>>;
  readonly inputChannels: BehaviorSubject<List<TransformerChannelDef>>;
  readonly outputChannels: BehaviorSubject<List<TransformerChannelDef>>;

  constructor(obj: TransformerDefInterface) {
    this.name = new BehaviorSubject(obj.name);
    this.properties = new BehaviorSubject(List(obj.properties));
    this.inputChannels = new BehaviorSubject(List(obj.inputChannels));
    this.outputChannels = new BehaviorSubject(List(obj.outputChannels));
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.name,
      this.properties,
      this.inputChannels,
      this.outputChannels,
      this.properties.switchMap(properties => Observable.merge(...properties.map(property => (property as PropertyDef).asObservable()).toArray())),
      this.inputChannels.switchMap(inChannels => Observable.merge(...inChannels.toArray().map(inChan => inChan.asObservable()))),
      this.outputChannels.switchMap(outChannels => Observable.merge(...outChannels.toArray().map(outChan => outChan.asObservable())))
    ).mapTo(this)
  }
}

export class TransformerDefBuilder extends ClassBuilder<TransformerDef> implements TransformerDefInterface {
  name: string;
  properties: PropertyDef[] = [];
  inputChannels: TransformerChannelDef[] = [];
  outputChannels: TransformerChannelDef[] = [];

  Name(name): this {
    this.name = name;
    return this;
  }
  Properties(properties: PropertyDef[]): this {
    this.properties = properties;
    return this;
  }
  pushProperty(...property: PropertyDef[]): this {
    this.properties.push(...property);
    return this;
  }
  withProperty(): NestedPropertyDefBuilder<this> {
    return new NestedPropertyDefBuilder((property) => { this.properties.push(property); return this; });
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
    return new NestedTransformerChannelDefBuilder((channel) => {this.inputChannels.push(channel); return this; });
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
  build(): TransformerDef {
    return new TransformerDef(this);
  }
}

export class NestedTransformerDefBuilder<Parent> extends TransformerDefBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (transformerDef: TransformerDef) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class TransformerDefArrayBuilder extends ClassArrayBuilder<TransformerDef, NestedTransformerDefBuilder<TransformerDefArrayBuilder>> {
  constructor() {
    super(NestedTransformerDefBuilder);
  }
}
