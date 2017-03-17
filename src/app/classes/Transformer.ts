import {Channel} from "./Channel";
type ApamaType = "integer" | "string" | "float" | "decimal" | "boolean";

export class TransformerProperty {
  name: string;
  value: any;
  type : ApamaType;
}

export class Transformer {
  inputChannels: Channel[] = [];
  outputChannels: Channel[] = [];
  properties: TransformerProperty[] = [];
}
