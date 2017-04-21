import {Config, ConfigBuilder} from "../classes/Config";
import {Channel} from "../classes/Channel";
import {BehaviorSubject} from "rxjs";
import {Transformer} from "../classes/Transformer";
import {List} from "immutable";

export abstract class AbstractDataService {
  readonly hierarchy: BehaviorSubject<Config> = new BehaviorSubject(new ConfigBuilder().build());
  readonly channels: BehaviorSubject<List<Channel>> = new BehaviorSubject(List<Channel>());
  readonly selectedTransformer: BehaviorSubject<Transformer|undefined> = new BehaviorSubject(undefined);
  readonly configurations: BehaviorSubject<List<Config>> = new BehaviorSubject(List<Config>());
}
