import {Config, ConfigSerializer} from "../classes/Config";
import {Injectable} from "@angular/core";
import {AbstractMetadataService} from "./MetadataService";
import {validate} from "validate.js";
import {ConfigDeserializer} from "../classes/ConfigDeserializer";
import {Metadata, MetadataJsonInterface} from "../classes/Metadata";

export class UserCancelled extends Error {}

export abstract class AbstractFileService {
  abstract serializeConfig(config: Config);
  abstract deserializeConfig(epl: string);
  abstract serializeMetadata(metadata: Metadata);
}

@Injectable()
export class FileService extends AbstractFileService {

  constructor(private readonly configSerializer: ConfigSerializer, private readonly configDeserializer: ConfigDeserializer, readonly metadataService: AbstractMetadataService) {
    super()
  }

  serializeConfig(config: Config) {
    return this.configSerializer.toApama(this.metadataService.metadata.getValue(), config);
  }

  deserializeConfig(epl: string) : Config {
    if (validate.isEmpty(epl)) { throw new Error('EPL string cannot be empty'); }
    return this.configDeserializer.fromApama(epl);
  }

  serializeMetadata(metadata: Metadata) : MetadataJsonInterface{
    return metadata.toJson();
  }

  getAnalyticDefinitions(fileType:string) : Promise<Array<{file: File, analyticDefinition: string}>> {
    return new Promise<FileList>((resolve, reject) => {
      let loadAnalyticFiles = document.createElement("INPUT") as HTMLInputElement;
      loadAnalyticFiles.type = "file";
      loadAnalyticFiles.accept = fileType;
      loadAnalyticFiles.onerror = reject;
      loadAnalyticFiles.onabort = reject;
      loadAnalyticFiles.multiple = true;
      loadAnalyticFiles.onchange = () => {
        if (loadAnalyticFiles.files) {
          resolve(loadAnalyticFiles.files);
        } else {
          reject(new UserCancelled());
        }
      };
      loadAnalyticFiles.click();
    })
    .then((analyticsFiles: FileList) => {
      return new Promise<Array<{ file: File, analyticDefinition: string }>>((resolve, reject) => {
        const analyticDefinitionPattern = /\/\*\s*@AnalyticDefinition\s*({[\s\S]*})\s*\*\//;
        const analyticDefinitions = Array<{file: File, analyticDefinition: string}>();

        let filesProcessed = 0;
        function analyticDefinitionsLoadComplete() {
          if (filesProcessed === analyticsFiles.length) {
            resolve(analyticDefinitions);
          }
        }
        Array.from(analyticsFiles).forEach((analyticFile: File) => {
          const fileReader = new FileReader();
          fileReader.onload = function () {
            // Parse the analyticDefinition out of the Analytic file
            const analyticDefinition = fileReader.result.match(analyticDefinitionPattern);
            if (analyticDefinition) {
              analyticDefinitions.push({
                file: analyticFile,
                analyticDefinition: analyticDefinition[1]
              });
            }
            filesProcessed++;
            analyticDefinitionsLoadComplete();
          };
          fileReader.onerror = reject;
          fileReader.onabort = reject;
          fileReader.readAsText(analyticFile);
          setTimeout(() => {
            reject(new Error("Timed out while reading file"));
            fileReader.abort();
            filesProcessed++;
            analyticDefinitionsLoadComplete();
          }, 2000);
        });
      });
    })
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
