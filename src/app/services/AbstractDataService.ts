import {Config, ConfigBuilder} from "../classes/Config";
import {RowChannel} from "../classes/Channel";
import {BehaviorSubject} from "rxjs";
import {Transformer} from "../classes/Transformer";
import {List} from "immutable";

export abstract class AbstractDataService {
  readonly hierarchy: BehaviorSubject<Config> = new BehaviorSubject(new ConfigBuilder().build());
  readonly channels: BehaviorSubject<List<RowChannel>> = new BehaviorSubject(List<RowChannel>());
  readonly selectedTransformer: BehaviorSubject<Transformer|undefined> = new BehaviorSubject(undefined);
  readonly configurations: BehaviorSubject<List<() => Config>> = new BehaviorSubject(List<() => Config>());

  abstract addAnalyticChannelsToChannelsPanel(transformer: Transformer);
  abstract removeAnalyticChannelsFromChannelsPanel(transformer: Transformer);
  abstract addChannel(channelName: string);
  abstract setModified(modifiedValue: boolean);
  abstract isModified(): boolean;
}
