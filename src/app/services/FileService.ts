import {Config, ConfigSerializer} from "../classes/Config";
import {Inject} from "@angular/core";

export class FileService {

  constructor(@Inject(ConfigSerializer) private configSerializer: ConfigSerializer) {}

  serialize(config: Config) {
    return this.configSerializer.toApama(config.toJson());
  }

}
