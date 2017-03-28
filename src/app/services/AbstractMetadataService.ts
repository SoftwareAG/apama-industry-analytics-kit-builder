import {Metadata} from "../classes/Metadata";

export abstract class AbstractMetadataService {
  getMeta: () => Metadata;
  withMeta: (callback: (meta: Metadata) => void) => void;
}
