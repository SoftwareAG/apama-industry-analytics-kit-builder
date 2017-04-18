import {Config, ConfigSerializer} from "../classes/Config";

export class FileService {

  static serialize(config: Config) {
    return ConfigSerializer.toApama(config.toJson());
  }

}
