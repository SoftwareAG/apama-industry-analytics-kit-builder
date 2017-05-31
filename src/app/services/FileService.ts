import {Config, ConfigSerializer} from "../classes/Config";
import {Injectable} from "@angular/core";
import {AbstractMetadataService} from "./MetadataService";
import {validate} from "validate.js";
import {ConfigDeserializer} from "../classes/ConfigDeserializer";

export class UserCancelled extends Error {}

export abstract class AbstractFileService {
  abstract serialize(config: Config);
  abstract deserialize(epl: string);
}

@Injectable()
export class FileService extends AbstractFileService {

  constructor(private readonly configSerializer: ConfigSerializer, private readonly configDeserializer: ConfigDeserializer, readonly metadataService: AbstractMetadataService) {
    super()
  }

  serialize(config: Config) {
    return this.configSerializer.toApama(this.metadataService.metadata.getValue(), config);
  }

  deserialize(epl: string) : Config {
    if (validate.isEmpty(epl)) { throw new Error('EPL string cannot be empty'); }
    return this.configDeserializer.fromApama(epl);
  }

  getFileData(fileType:string) : Promise<{file: File, fileContent: string}> {
    return new Promise<File>((resolve, reject) => {
      let loadFile = document.createElement("INPUT") as HTMLInputElement;
      loadFile.type = "file";
      loadFile.accept = fileType;
      loadFile.onerror = reject;
      loadFile.onabort = reject;
      loadFile.onchange = () => {
        if (loadFile.files && loadFile.files[0]) {
          resolve(loadFile.files[0]);
        } else {
          reject(new UserCancelled());
        }
      };
      loadFile.click();
    })
    .then(file => {
      return new Promise<{file: File, fileContent: string}>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = function () {
          fileReader.result;
          resolve({
            file: file,
            fileContent: fileReader.result
          });
        };
        fileReader.onerror = reject;
        fileReader.onabort = reject;
        fileReader.readAsText(file);
        setTimeout(() => {
          reject(new Error("Timed out while reading file"));
          fileReader.abort();
        }, 2000);
      });
    });
  }

}
