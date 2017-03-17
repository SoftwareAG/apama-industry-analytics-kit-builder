
import {Transformer} from "./Transformer";
import {Channel} from "./Channel";
export class Row {

  transformers: Transformer[] = [];

  getInChannels() : Channel[] {
      return this.transformers.length ? this.transformers[0].inputChannels : [];
  }

  getOutChannels() : Channel[] {
    return this.transformers.length ?  this.transformers[this.transformers.length-1].outputChannels : [];
  }

}

