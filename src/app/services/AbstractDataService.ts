import {Config, ConfigBuilder} from "../classes/Config";
import {BehaviorSubject} from "rxjs";
import {List} from "immutable";

export abstract class AbstractDataService {
  readonly hierarchy: BehaviorSubject<Config> = new BehaviorSubject(new ConfigBuilder().build());
  readonly configurations: BehaviorSubject<List<() => Config>> = new BehaviorSubject(List<() => Config>());
  abstract setModified(modifiedValue: boolean);
  abstract isModified(): boolean;
}
