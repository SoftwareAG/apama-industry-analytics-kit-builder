import { Validator} from "class-validator";
import * as _ from "lodash";
import {TransformerDef, TransformerDefInterface} from "./TransformerDef";

const validator = new Validator();

export interface MetadataInterface {
  transformers?: TransformerDefInterface[]
}

export class Metadata {
  readonly transformers: ReadonlyArray<TransformerDef>;

  constructor(obj: MetadataInterface = {}) {
    if (!_.isPlainObject(obj)) { throw new Error('must have an object to construct from'); }
    const transformers = obj.transformers || [];
    if (!validator.isArray(transformers)) { throw new Error('Unable to parse json object'); }
    this.transformers = transformers.map((transformerObj) => { return new TransformerDef(transformerObj); });
    if (!validator.arrayUnique(this.transformers.map((transformer: TransformerDef) => { return transformer.name }))) { throw new Error('Transformers must be unique by name'); }
  }
}
