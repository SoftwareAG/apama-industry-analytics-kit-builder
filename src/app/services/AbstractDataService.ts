
import {Config} from "../classes/Config";
import {Channel} from "../classes/Channel";
import {TransformerDef} from "../classes/TransformerDef";
import {BehaviorSubject, Observable} from "rxjs";
import {Transformer} from "../classes/Transformer";

export abstract class AbstractDataService {
  readonly channels: Observable<Channel[]>;
  readonly transformers: Observable<TransformerDef[]>;
  readonly hierarchy: Observable<Config>;
  readonly selectedTransformer: BehaviorSubject<Transformer|undefined>
}
