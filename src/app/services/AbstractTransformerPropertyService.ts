import {Property} from "../classes/Property";

export abstract class AbstractTransformerPropertyService {
  getTransformerProperties: () => Property[];
  withTransformerProperties: (callback: (properties: Property[]) => void) => void;
}
