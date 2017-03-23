import {Channel, ChannelInterface} from "./Channel";
import {Validator} from "class-validator";
import {PropertyInterface, Property, ValidProperty} from "./Property";
import * as _ from "lodash";
import {TransformerDef, TransformerDefInterface} from "./TransformerDef";

const validator = new Validator();

export interface TransformerInterface extends TransformerDefInterface {
  inputChannels?: ReadonlyArray<ChannelInterface>,
  outputChannels?: ReadonlyArray<ChannelInterface>,
  properties?: ReadonlyArray<PropertyInterface>
}

export class Transformer extends TransformerDef {
  inputChannels: Channel[];
  outputChannels: Channel[];
  readonly properties: ReadonlyArray<ValidProperty>;

  constructor(obj: TransformerInterface) {
    if (!_.isPlainObject(obj)) { throw new Error('must have an object to construct from'); }
    const inputChannels = obj.inputChannels || [];
    const outputChannels = obj.outputChannels || [];
    const properties = obj.properties || [];
    if (!validator.isArray(inputChannels)) { throw new Error(`Unable to construct Transformer, invalid inputChannels: ${obj.inputChannels}`); }
    if (!validator.isArray(outputChannels)) { throw new Error(`Unable to construct Transformer, invalid outputChannels: ${obj.outputChannels}`); }
    if (!validator.isArray(properties)) { throw new Error(`Unable to construct Transformer, invalid properties: ${obj.properties}`); }
    super(obj);
    this.inputChannels = inputChannels.map(channelObj => { return new Channel(channelObj); });
    this.outputChannels = outputChannels.map(channelObj => { return new Channel(channelObj); });
    this.properties = properties.map(propertyObj => { return Property.fromObject(propertyObj); });
    if (!validator.arrayUnique(this.properties.map(prop => { return prop.name }))) { throw new Error('Unable to parse json object'); }
  }
}
