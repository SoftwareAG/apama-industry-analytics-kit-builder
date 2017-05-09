import {Config, ConfigSerializer} from "../classes/Config";
import {Inject, Injectable} from "@angular/core";
import {AbstractMetadataService} from "./MetadataService";

@Injectable()
export class FileService {

  constructor(private readonly configSerializer: ConfigSerializer, readonly metadataService: AbstractMetadataService) {}

  serialize(config: Config) {
    return this.configSerializer.toApama(this.metadataService.metadata.getValue(), config);
  }

}
