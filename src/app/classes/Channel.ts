import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {BehaviorSubject, Observable} from "rxjs";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {AbstractModel} from "./AbstractModel";

export interface ChannelJsonInterface {
  name: string;
}

export interface ChannelInterface {
  name: string;
}

export class Channel extends AbstractModel<ChannelJsonInterface> implements AsObservable, BehaviorSubjectify<ChannelInterface> {
  readonly name: BehaviorSubject<string>;

  constructor(obj: ChannelInterface) {
    super();
    this.name = new BehaviorSubject<string>(obj.name);
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.name
    ).mapTo(this);
  }
}

export class ChannelBuilder extends ClassBuilder<Channel> implements ChannelInterface {
  name: string;

  Name(name: string): this {
    this.name = name;
    return this
  }

  build(): Channel {
    return new Channel(this);
  }

  static fromJson(json: ChannelJsonInterface) {
    return new ChannelBuilder()
      .Name(json.name);
  }
}

export class NestedChannelBuilder<Parent> extends ChannelBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (channel: Channel) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class ChannelArrayBuilder extends ClassArrayBuilder<Channel, NestedChannelBuilder<ChannelArrayBuilder>> {
  constructor() {
    super(NestedChannelBuilder);
  }
}
