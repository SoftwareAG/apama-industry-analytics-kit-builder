
import {Validator} from "class-validator";

const validator = new Validator();

export interface ChannelInterface {
  name: string;
}

export class Channel {
  name: string;

  constructor(obj: ChannelInterface) {
    if (!_.isPlainObject(obj)) { throw new Error('must have an object to construct from'); }
    if (!validator.isString(obj.name)) { throw new Error('Unable to parse json object'); }
    if (!obj.name) { throw new Error('Unable to parse json object'); }
    this.name = obj.name;
  }
}
