import {Metadata, MetadataBuilder, MetadataJsonInterface} from "../classes/Metadata";
import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {TransformerDefBuilder, TransformerDefJsonInterface} from "../classes/TransformerDef";

export abstract class AbstractMetadataService {
  readonly metadata: BehaviorSubject<Metadata> = new BehaviorSubject(new MetadataBuilder().build());
  abstract loadMetadata(json: MetadataJsonInterface);
  abstract loadAnalytic(json: TransformerDefJsonInterface);

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

  loadAnalytic(analyticJSONData: TransformerDefJsonInterface) {
    const currentMetaData = this.metadata.getValue().toJson();
    const customAnalytic = TransformerDefBuilder.fromJson(analyticJSONData).build();
    if (currentMetaData.analytics) {
      currentMetaData.analytics.push(customAnalytic.toJson());
    }
    this.metadata.next(MetadataBuilder.fromJson(currentMetaData).build());
  }
}

