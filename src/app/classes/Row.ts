import {
  NestedTransformerBuilder, Transformer, TransformerBuilder, TransformerJsonInterface,
  TransformerSerializer
} from "./Transformer";
import {Channel, ChannelJsonInterface, NestedChannelBuilder, ChannelBuilder} from "./Channel";
import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {TransformerChannelDef} from "./TransformerChannelDef";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {List} from "immutable";
import {AbstractModel} from "./AbstractModel";
import {Inject, Injectable} from "@angular/core";

export interface RowJsonInterface {
  maxTransformerCount: number;
  transformers : TransformerJsonInterface[];
  inputChannelOverrides: (ChannelJsonInterface | undefined)[];
  outputChannelOverrides: (ChannelJsonInterface | undefined)[];
}

export interface RowInterface {
  maxTransformerCount: number;
  transformers : Transformer[];
  inputChannelOverrides: (Channel | undefined)[];
  outputChannelOverrides: (Channel | undefined)[];
}

export class Row extends AbstractModel<RowJsonInterface> implements AsObservable, BehaviorSubjectify<RowInterface>  {
  readonly maxTransformerCount: BehaviorSubject<number>;
  readonly transformers : BehaviorSubject<List<Transformer>>;
  readonly inputChannelOverrides: BehaviorSubject<List<Channel | undefined>>;
  readonly outputChannelOverrides: BehaviorSubject<List<Channel | undefined>>;

  constructor(obj: RowInterface) {
    super();
    this.maxTransformerCount = new BehaviorSubject(obj.maxTransformerCount);
    this.transformers = new BehaviorSubject(List(obj.transformers));
    this.inputChannelOverrides = new BehaviorSubject(List(obj.inputChannelOverrides));
    this.outputChannelOverrides = new BehaviorSubject(List(obj.outputChannelOverrides));
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.maxTransformerCount,
      this.transformers,
      this.inputChannelOverrides,
      this.outputChannelOverrides,
      this.transformers.switchMap(transformers => Observable.merge(...transformers.toArray().map(transformer => transformer.asObservable()))),
      this.inputChannelOverrides.switchMap(inChannels => Observable.merge(...inChannels.toArray().map(inChan => inChan ? inChan.asObservable() : Observable.of(undefined)))),
      this.outputChannelOverrides.switchMap(outChannels => Observable.merge(...outChannels.toArray().map(outChan => outChan ? outChan.asObservable() : Observable.of(undefined)))),
    ).mapTo(this);
  }

  getInChannels(): List<Channel | TransformerChannelDef> {
    // Must have the same number of input channels as the first transformer
    const requiredChannels = this.transformers.getValue().size ? this.transformers.getValue().first().inputChannels.getValue() : List();
    // If the row contains an override then return that otherwise return the Default ChannelDef from the first transformer
    return requiredChannels.map((channelDef: TransformerChannelDef, i: number) => this.inputChannelOverrides.getValue().size > i && this.inputChannelOverrides.getValue().get(i) || channelDef) as List<Channel | TransformerChannelDef>;
  }

  getOutChannels(): List<Channel | TransformerChannelDef> {
    // Must have the same number of output channels as the last transformer
    const requiredChannels = this.transformers.getValue().size ? this.transformers.getValue().last().outputChannels.getValue() : List();
    // If the row contains an override then return that otherwise return the Default ChannelDef from the last transformer
    return requiredChannels.map((channelDef: TransformerChannelDef, i: number) => { return this.outputChannelOverrides.getValue().size > i && this.outputChannelOverrides.getValue().get(i) || channelDef; }) as List<Channel | TransformerChannelDef>;
  }
}

export class RowBuilder extends ClassBuilder<Row> implements RowInterface {
  maxTransformerCount: number;
  transformers: Transformer[] = [];
  inputChannelOverrides: (Channel | undefined)[] = [];
  outputChannelOverrides: (Channel | undefined)[] = [];

  MaxTransformerCount(maxTransformerCount: number): this {
    this.maxTransformerCount = maxTransformerCount;
    return this;
  }

  Transformers(transformers: Transformer[]): this {
    this.transformers = transformers;
    return this;
  }
  pushTransformer(...transformer: Transformer[]): this {
    this.transformers.push(...transformer);
    return this;
  }
  withTransformer(): NestedTransformerBuilder<this> {
    return new NestedTransformerBuilder<this>((transformer) => { this.transformers.push(transformer); return this; });
  }

  InputChannels(inputChannelOverrides: (Channel | undefined)[]): this {
    this.inputChannelOverrides = inputChannelOverrides;
    return this;
  }
  pushInputChannel(...inputChannelOverride: (Channel | undefined)[]): this {
    this.inputChannelOverrides.push(...inputChannelOverride);
    return this;
  }
  withInputChannel(): NestedChannelBuilder<this> {
    return new NestedChannelBuilder((channel) => {this.inputChannelOverrides.push(channel); return this;})
  }

  OutputChannels(outputChannelOverrides: (Channel | undefined)[]): this {
    this.outputChannelOverrides = outputChannelOverrides;
    return this;
  }
  pushOutputChannel(...outputChannelOverride: (Channel | undefined)[]): this {
    this.outputChannelOverrides.push(...outputChannelOverride);
    return this;
  }
  withOutputChannel(): NestedChannelBuilder<this> {
    return new NestedChannelBuilder((channel) => {this.outputChannelOverrides.push(channel); return this;})
  }

  build(): Row {
    return new Row(this);
  }

  static fromJson(json: RowJsonInterface) : RowBuilder {
    return new RowBuilder()
      .MaxTransformerCount(json.maxTransformerCount)
      .Transformers(json.transformers.map((transformer) => TransformerBuilder.fromJson(transformer).build()))
      .InputChannels(json.inputChannelOverrides.map((inChan) => inChan ? ChannelBuilder.fromJson(inChan).build() : undefined))
      .OutputChannels(json.outputChannelOverrides.map((outChan) => outChan ? ChannelBuilder.fromJson(outChan).build() : undefined))
  }
}

export class NestedRowBuilder<Parent> extends RowBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (row: Row) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class RowArrayBuilder extends ClassArrayBuilder<Row, NestedRowBuilder<RowArrayBuilder>> {
  constructor() {
    super(NestedRowBuilder);
  }
}
@Injectable()
export class RowSerializer {

  constructor(private transformerSerializer: TransformerSerializer) {}

  toApama(row: RowJsonInterface, rowIndex: number) {
    return "" +
      `\\\\ Row: ${rowIndex}\n` +
      row.transformers.map((transformer, transformerIndex) => this.transformerSerializer.toApama(transformer, transformerIndex, row, rowIndex))
        .join('\n');
  }
}
