import {Metadata, MetadataBuilder, MetadataJsonInterface} from "../classes/Metadata";
import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {TransformerDefBuilder, TransformerDefJsonInterface} from "../classes/TransformerDef";

export abstract class AbstractMetadataService {
  readonly metadata: BehaviorSubject<Metadata> = new BehaviorSubject(new MetadataBuilder().build());
  abstract loadMetadata(json: MetadataJsonInterface);
  abstract loadAnalytic(...json: TransformerDefJsonInterface[]);

  getMetadata(): Metadata {
    return this.metadata.getValue();
  }

  getAnalytic(name: string) {
    return this.metadata.getValue().getAnalytic(name);
  }

  createAnalytic(name: string) {
    return this.metadata.getValue().createAnalytic(name);
  }
}

@Injectable()
export class MetadataService extends AbstractMetadataService {
  loadMetadata(json: MetadataJsonInterface) {
    this.metadata.next(MetadataBuilder.fromJson(json).build());
  }

  loadAnalytic(...analyticJSONData: TransformerDefJsonInterface[]) {
    const currentMetaDataJson = this.metadata.getValue().toJson();
    // This cast is safe because calling toJson will never give undefined for analytics array
    (currentMetaDataJson.analytics as TransformerDefJsonInterface[]).push(...analyticJSONData);
    this.metadata.next(MetadataBuilder.fromJson(currentMetaDataJson).build());
  }
}

