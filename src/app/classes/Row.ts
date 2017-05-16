import {
  NestedTransformerBuilder,
  Transformer,
  TransformerBuilder,
  TransformerJsonInterface,
  TransformerSerializer
} from "./Transformer";
import {RowChannelBuilder, ChannelJsonInterface, NestedChannelBuilder, RowChannel} from "./Channel";
import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AsObservable} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {List, Map} from "immutable";
import {AbstractModel} from "./AbstractModel";
import {Injectable} from "@angular/core";
import {Metadata} from "./Metadata";
import * as _ from "lodash";
import {TransformerChannel} from "app/classes/TransformerChannel";
import {TransformerChannelDef} from "./TransformerChannelDef";

export interface RowJsonInterface {
  maxTransformerCount: number;
  transformers : TransformerJsonInterface[];
  inputChannelOverrides: {[i: number]: ChannelJsonInterface};
  outputChannelOverrides: {[i: number]: ChannelJsonInterface};
}

export interface RowInterface {
  maxTransformerCount: number;
  transformers : Transformer[];
  inputChannelOverrides: {[i: number]: RowChannel};
  outputChannelOverrides: {[i: number]: RowChannel};
}

export class Row extends AbstractModel<RowJsonInterface, never> implements AsObservable  {
  readonly maxTransformerCount: BehaviorSubject<number>;
  readonly transformers: BehaviorSubject<List<Transformer>>;
  readonly inputChannelOverrides: BehaviorSubject<Map<number, RowChannel>>;
  readonly outputChannelOverrides: BehaviorSubject<Map<number, RowChannel>>;

  constructor(obj: RowInterface) {
    super();
    this.maxTransformerCount = new BehaviorSubject(obj.maxTransformerCount);
    this.transformers = new BehaviorSubject(List(obj.transformers));
    this.inputChannelOverrides = new BehaviorSubject(Map<number, RowChannel>(_.map(obj.inputChannelOverrides, (chan, i: string) => [Math.round(parseFloat(i)), chan])));
    this.outputChannelOverrides = new BehaviorSubject(Map<number, RowChannel>(_.map(obj.outputChannelOverrides, (chan, i: string) => [Math.round(parseFloat(i)), chan])));
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

  getInChannels(metadata: Metadata): List<RowChannel | TransformerChannel> {
    // Guarantee ordering by iterating the channelDefs rather than the channels
    const requiredChannels = this.transformers.getValue().isEmpty() ? List() : metadata.getAnalytic(this.transformers.getValue().first().name).inputChannels.flatMap((channel: TransformerChannelDef) => this.transformers.getValue().first().getInputChannels(channel.name)) as List<TransformerChannel>;
    return requiredChannels.map((channelDef: TransformerChannel, i: number) => this.inputChannelOverrides.getValue().get(i) || channelDef) as List<RowChannel | TransformerChannel>;
  }

  getOutChannels(metadata: Metadata): List<RowChannel | TransformerChannel> {
    // Guarantee ordering by iterating the channelDefs rather than the channels
    const requiredChannels = this.transformers.getValue().isEmpty() ? List() : metadata.getAnalytic(this.transformers.getValue().last().name).outputChannels.flatMap((channel: TransformerChannelDef) => this.transformers.getValue().last().getOutputChannels(channel.name)) as List<TransformerChannel>;
    return requiredChannels.map((channelDef: TransformerChannel, i: number) => this.outputChannelOverrides.getValue().get(i) || channelDef) as List<RowChannel | TransformerChannel>;
  }

  validate(): this {
    // TODO: do some validation
    if (this.maxTransformerCount.getValue() <= 0) { throw new Error('Max transformer count must be greater than 0'); }
    return this
  }

  removeTransformer(transformer: Transformer) {
    this.transformers.next(List<Transformer>(this.transformers.getValue().filter(t => t !== transformer)))
  }
}

export class RowBuilder extends ClassBuilder<Row> implements RowInterface {
  maxTransformerCount: number;
  transformers: Transformer[] = [];
  inputChannelOverrides: { [i: number]: RowChannel; } = {};
  outputChannelOverrides: { [i: number]: RowChannel; } = {};

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

  InputChannels(inputChannelOverrides: { [i: number]: RowChannel; }): this {
    this.inputChannelOverrides = inputChannelOverrides;
    return this;
  }
  pushInputChannel(inputChannelOverride: { [i: number]: RowChannel; }): this {
    Object.assign(this.inputChannelOverrides, inputChannelOverride);
    return this;
  }
  withInputChannel(i: number): NestedChannelBuilder<this> {
    return new NestedChannelBuilder((channel) => {this.inputChannelOverrides[i] = channel; return this;})
  }

  OutputChannels(outputChannelOverrides: { [i: number]: RowChannel; }): this {
    this.outputChannelOverrides = outputChannelOverrides;
    return this;
  }
  pushOutputChannel(outputChannelOverrides: { [i: number]: RowChannel; }): this {
    Object.assign(this.outputChannelOverrides, outputChannelOverrides);
    return this;
  }
  withOutputChannel(i: number): NestedChannelBuilder<this> {
    return new NestedChannelBuilder((channel) => {this.outputChannelOverrides[i] = channel; return this;})
  }

  build(): Row {
    return new Row(this);
  }

  static fromJson(json: RowJsonInterface) : RowBuilder {
    return new RowBuilder()
      .MaxTransformerCount(json.maxTransformerCount)
      .Transformers(json.transformers.map((transformer) => TransformerBuilder.fromJson(transformer).build()))
      .InputChannels(_.mapValues(json.inputChannelOverrides, (chan: ChannelJsonInterface) => RowChannelBuilder.fromJson(chan).build()))
      .OutputChannels(_.mapValues(json.outputChannelOverrides, (chan: ChannelJsonInterface) => RowChannelBuilder.fromJson(chan).build()))
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

  toApama(metadata: Metadata, row: Row, rowIndex: number) {
    row.validate();

    if (!row.transformers.getValue().size) {
      return "";
    }

    return `\\\\ Row: ${rowIndex}\n` +
      row.transformers.getValue().map((transformer: Transformer, transformerIndex: number) => this.transformerSerializer.toApama(transformer, metadata.getAnalytic(transformer.name), transformerIndex, row, rowIndex))
        .join('\n');
  }
}
