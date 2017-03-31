
import {Config} from "../classes/Config";
import {Channel} from "../classes/Channel";
import {TransformerDef} from "../classes/TransformerDef";
import {Observable} from "rxjs";

export abstract class AbstractDataService {
  readonly channels: Observable<Channel[]>;
  readonly transformers: Observable<TransformerDef[]>;
  readonly hierarchy: Observable<Config>;
}
