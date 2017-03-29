import {Config, ConfigBuilder} from "../classes/Config";
import {Channel} from "../classes/Channel";
import {TransformerDef} from "../classes/TransformerDef";
import {BehaviorSubject, Observable} from "rxjs";
import {AbstractDataService} from "./AbstractDataService";

export class DataService implements AbstractDataService {
  private _channels: BehaviorSubject<Channel[]> = new BehaviorSubject([]);
  private _transformers: BehaviorSubject<TransformerDef[]> = new BehaviorSubject([]);
  private _hierarchy: BehaviorSubject<Config> = new BehaviorSubject(new ConfigBuilder().build());

  readonly channels: Observable<Channel[]> = this._channels.asObservable();
  readonly transformers: Observable<TransformerDef[]> = this._transformers.asObservable();
  readonly hierarchy: Observable<Config> = this._hierarchy.asObservable();
}
