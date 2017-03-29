import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";

export interface ChannelInterface {
  name: string;
}

export class Channel implements ChannelInterface {
  name: string;

  constructor(obj: ChannelInterface) {
    this.name = obj.name;
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
