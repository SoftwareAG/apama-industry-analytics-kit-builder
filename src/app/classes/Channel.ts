import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {BehaviorSubject, Observable} from "rxjs";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {AbstractModel} from "./AbstractModel";
import {validate} from "validate.js";
import {Utils} from "../Utils";

export interface ChannelJsonInterface {
  name: string;
}

export interface ChannelInterface {
  name: string;
}

export class RowChannel extends AbstractModel<ChannelJsonInterface, never> implements AsObservable, BehaviorSubjectify<ChannelInterface> {
  readonly name: BehaviorSubject<string>;

  constructor(obj: ChannelInterface) {
    super();
    this.name = new BehaviorSubject<string>(obj.name);
  }

  asObservable(): Observable<this> {
    return Utils.hotObservable(Observable.merge(
      this.name
    ).mapTo(this));
  }

  validate(): this {
    if (validate.isEmpty(this.name.getValue())) { throw new Error('Name cannot be empty'); }
    return this;
  }

  clone(): RowChannel {
    return RowChannelBuilder.fromJson(this.toJson()).build();
  }
}

export class RowChannelBuilder extends ClassBuilder<RowChannel> implements ChannelInterface {
  name: string;

  Name(name: string): this {
    this.name = name;
    return this
  }

  build(): RowChannel {
    return new RowChannel(this);
  }

  static fromJson(json: ChannelJsonInterface) {
    return new RowChannelBuilder()
      .Name(json.name);
  }
}

export class NestedChannelBuilder<Parent> extends RowChannelBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (channel: RowChannel) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class ChannelArrayBuilder extends ClassArrayBuilder<RowChannel, NestedChannelBuilder<ChannelArrayBuilder>> {
  constructor() {
    super(NestedChannelBuilder);
  }
}
