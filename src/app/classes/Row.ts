import {Transformer, TransformerInterface} from "./Transformer";
import {Channel} from "./Channel";
import {Validator} from "class-validator";
import * as _ from "lodash";

const validator = new Validator();

export interface RowInterface {
  maxTransformerCount: number
  transformers?: TransformerInterface[]
}

export class Row {

  readonly maxTransformerCount: number;

  transformers : Transformer[] = [];

  constructor(obj: RowInterface = { maxTransformerCount: 3 }) {
    if (!_.isPlainObject(obj)) { throw new Error('must have an object to construct from'); }
    if (!validator.isInt(obj.maxTransformerCount)) { throw new Error('Unable to parse json object'); }
    if (!validator.isPositive(obj.maxTransformerCount)) { throw new Error('Unable to parse json object'); }
    const transformers = obj.transformers || [];
    if (!validator.isArray(transformers)) { throw new Error('Unable to parse json object'); }
    if (transformers.length > obj.maxTransformerCount) { throw new Error('Unable to parse json object'); }
    this.maxTransformerCount = obj.maxTransformerCount;
    this.transformers = transformers.map((transformerObj) => { return new Transformer(transformerObj); });
  }

  getInChannels(): Channel[] {
    return this.transformers.length ? this.transformers[0].inputChannels : [];
  }

  getOutChannels(): Channel[] {
    return this.transformers.length ? this.transformers[this.transformers.length - 1].outputChannels : [];
  }
}
