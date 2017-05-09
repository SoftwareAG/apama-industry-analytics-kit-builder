import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {List} from "immutable";

export abstract class AbstractModel<JsonModel, Definition> {
  toJson(): JsonModel {
    return Object.keys(this).reduce((result, key) => {
      let value = this[key];
      if (value instanceof BehaviorSubject) {
        value = value.getValue();
      }
      if (List.isList(value)) {
        result[key] = value.toArray().map((val) => {
          if (val instanceof AbstractModel) {
            return val.toJson();
          } else {
            return val;
          }
        })
      } else {
        result[key] = value;
      }
      return result;
    }, {}) as JsonModel;
  }

  abstract validate(def?: Definition): this;
}
