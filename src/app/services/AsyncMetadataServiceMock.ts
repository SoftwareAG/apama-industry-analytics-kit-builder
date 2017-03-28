import {Injectable} from "@angular/core";
import {Metadata} from "../classes/Metadata";
import {AbstractMetadataService} from "./AbstractMetadataService";

@Injectable()
export class AsyncMetadataServiceMock implements AbstractMetadataService {
  //noinspection JSMethodCanBeStatic
  getMeta() {
    return new Metadata({
      transformers: [{
        name: "MyFirstAnalytic",
        properties: [{ name: "Property1", optional: true, type: "integer" as "integer" }]
      },{
        name: "MySecondAnalytic",
        properties: [{ name: "Property1", optional: true, type: "integer" as "integer" }]
      }]
    });
  }

  //noinspection JSMethodCanBeStatic
  withMeta(callback: (meta: Metadata) => void) {
    setTimeout(() => { callback(this.getMeta()); });
    // Simulate an update every 10 seconds
    setInterval(() => { callback(this.getMeta()); }, 10000);
  }
}
