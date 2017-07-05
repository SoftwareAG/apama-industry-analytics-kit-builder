import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {List, Map} from "immutable";

export abstract class AbstractModel<JsonModel, Definition> {
  toJson(): JsonModel {
    return Object.keys(this).reduce((result, key) => {
      let value = this[key];
      if (value instanceof BehaviorSubject) {
        value = value.getValue();
      }
      if (Map.isMap(value)) {
        result[key] = value.mapKeys(ifAbstractThenToJson).mapEntries(ifAbstractThenToJson).toJSON();
      } else if (List.isList(value)) {
        result[key] = value.toArray().map(ifAbstractThenToJson)
      } else {
        result[key] = value;
      }
      return result;
    }, {}) as JsonModel;
  }

  abstract validate(def?: Definition): this;
}

function ifAbstractThenToJson(obj: any): any {
  if (obj instanceof AbstractModel) {
    return obj.toJson();
  } else {
    return obj;
  }
}
