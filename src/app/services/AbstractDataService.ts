import {Config} from "../classes/Config";
import {Channel} from "../classes/Channel";
import {TransformerDef} from "../classes/TransformerDef";
import {BehaviorSubject} from "rxjs";
import {Transformer} from "../classes/Transformer";
import {List} from "immutable";

export abstract class AbstractDataService {
  readonly transformers: BehaviorSubject<List<TransformerDef>>;
  readonly hierarchy: BehaviorSubject<Config>;
  readonly channels: BehaviorSubject<List<Channel>>;
  readonly selectedTransformer: BehaviorSubject<Transformer|undefined>;
  readonly configurations: BehaviorSubject<List<Config>>;
}
