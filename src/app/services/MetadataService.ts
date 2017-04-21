import {Metadata, MetadataBuilder, MetadataJsonInterface} from "../classes/Metadata";
import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export abstract class AbstractMetadataService {
  readonly metadata: BehaviorSubject<Metadata> = new BehaviorSubject(new MetadataBuilder().build());
  abstract loadMetadata(json: MetadataJsonInterface);
}

@Injectable()
export class MetadataService extends AbstractMetadataService {
  loadMetadata(json: MetadataJsonInterface) {
    this.metadata.next(MetadataBuilder.fromJson(json).build());
  }
}

