import {Config, ConfigBuilder} from "../classes/Config";
import {BehaviorSubject} from "rxjs";
import {Observable} from "rxjs/Observable";

export abstract class AbstractDataService {
  readonly hierarchy: BehaviorSubject<Config> = new BehaviorSubject(new ConfigBuilder().build());
  abstract setModified(modifiedValue: boolean);
  abstract isModified(): Observable<boolean>;
}
