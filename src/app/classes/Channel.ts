import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {BehaviorSubject, Observable} from "rxjs";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";

export interface ChannelInterface {
  name: string;
}

export class Channel implements AsObservable, BehaviorSubjectify<ChannelInterface> {
  readonly name: BehaviorSubject<string>;

  constructor(obj: ChannelInterface) {
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
