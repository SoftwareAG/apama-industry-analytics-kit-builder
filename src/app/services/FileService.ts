import {Config, ConfigSerializer} from "../classes/Config";
import {Inject, Injectable} from "@angular/core";

@Injectable()
export class FileService {

  constructor(private configSerializer: ConfigSerializer) {}

  serialize(config: Config) {
    return this.configSerializer.toApama(config.toJson());
  }

}
