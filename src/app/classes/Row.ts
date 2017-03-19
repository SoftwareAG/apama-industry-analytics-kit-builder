import {Transformer} from "./Transformer";
import {Channel} from "./Channel";
import {IsInt, IsPositive} from "class-validator";
import {MatchesPredicate} from "../decorators/MatchesPredicate";
export class Row {

  @IsInt()
  @IsPositive()
  readonly maxTransformerCount: number;

  @MatchesPredicate(function(value) { return value.length <= this.maxTransformerCount; }, { message: "There cannot be more transformers than the maxCount" })
  transformers : Transformer[] = [];

  constructor(maxTransformerCount: number = 3) {
    this.maxTransformerCount = maxTransformerCount;
  }

  getInChannels(): Channel[] {
    return this.transformers.length ? this.transformers[0].inputChannels : [];
  }

  getOutChannels(): Channel[] {
    return this.transformers.length ? this.transformers[this.transformers.length - 1].outputChannels : [];
  }
}
