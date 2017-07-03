import {Config, ConfigSerializer} from "../classes/Config";
import {Injectable} from "@angular/core";
import {AbstractMetadataService} from "./MetadataService";
import {validate} from "validate.js";
import {ConfigDeserializer} from "../classes/ConfigDeserializer";
import {Metadata, MetadataJsonInterface} from "../classes/Metadata";
import * as Promise from "bluebird";
import {Utils} from "../Utils";
import {TransformerDefBuilder, TransformerDefJsonInterface} from "../classes/TransformerDef";

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

  getAnalyticDefinitions(fileType:string) : Promise<Array<{file: File, analyticDefinition: TransformerDefJsonInterface}>> {
    // Create the load file dialog
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
      // Read the file(s)
      .map((analyticFile: File) => {
        return new Promise<{ file: File, content: string }>((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = function () {
            resolve({
              file: analyticFile,
              content: fileReader.result
            });
          };
          fileReader.onerror = reject;
          fileReader.onabort = reject;
          fileReader.readAsText(analyticFile);
          setTimeout(() => {
            reject(new Error("Timed out while reading file"));
            fileReader.abort();
          }, 2000);
        })
      })
      // Find the @AnalyticDefinition's
      .map((analyticFile: {file: File, content: string}) => {
        const analyticDefinitionPattern = /\/\*\s*@AnalyticDefinition\s*({(.|[\n\r])*?})\s*\*\//g;
        const analyticDefinitions = Utils.findAll(analyticDefinitionPattern, analyticFile.content).map(groups => groups[0]);
        return {file: analyticFile.file, analyticDefs: analyticDefinitions};
      })
      // Flatmap to get a single (non-nested) array of all of the analyticDefinitions
      .reduce((acc, fileAnalytics: {file: File, analyticDefs: string[]}) => {
        acc.push(...fileAnalytics.analyticDefs.map(analyticDef => { return {file: fileAnalytics.file, analyticDefinition: analyticDef} }));
        return acc;
      }, Array<{ file: File, analyticDefinition: string }>())
      // Convert the text analyticDefinition to Json
      .map((fileAnalytic: {file: File, analyticDefinition: string}) => {
        return {file: fileAnalytic.file, analyticDefinition: JSON.parse(fileAnalytic.analyticDefinition)}
      })
      // Validate it
      .map((fileAnalytic: {file: File, analyticDefinition: TransformerDefJsonInterface}) => {
        try {
          TransformerDefBuilder.fromJson(fileAnalytic.analyticDefinition).build().validate();
        } catch(e) {
          throw new Error(`Invalid @AnalyticDefinition in file: ${fileAnalytic.file.name}`);
        }
        return fileAnalytic;
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
