import {Injectable} from "@angular/core";
import {Metadata} from "../classes/Metadata";
import {MetadataServiceInterface} from "./AbstractMetadataService";

@Injectable()
export class StaticMetadataService implements MetadataServiceInterface {

  getMeta() {
    return new Metadata({
      transformers: [{
        name: "MyFirstAnalytic",
        properties: [{ name: "Property1", optional: true, type: "integer" as "integer" }]
      }]
    });
  }
}
