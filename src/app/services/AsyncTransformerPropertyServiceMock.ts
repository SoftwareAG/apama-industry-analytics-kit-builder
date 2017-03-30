

import {Injectable} from "@angular/core";
import {Property} from "../classes/Property";
import {AbstractTransformerPropertyService} from "./AbstractTransformerPropertyService";

@Injectable()
export class AsyncTransformerPropertyServiceMock implements AbstractTransformerPropertyService {

  //noinspection JSMethodCanBeStatic
  getTransformerProperties() {
    return [
      Property.fromObject({
        name: 'decimalProperty_required',
        description: 'decimalPropertyDescription',
        type: 'decimal',
        optional: false,
        value: 2.0
      }),
      Property.fromObject({
        name: 'integerProperty_required',
        description: 'integerPropertyDescription',
        type: 'integer',
        optional: false,
        value: 5
      }),
      Property.fromObject({
        name: 'floatProperty_required',
        description: 'floatPropertyDescription',
        type: 'float',
        optional: false,
        value: 5
      }),
      Property.fromObject({
        name: 'booleanProperty_required',
        description: 'booleanPropertyDescription',
        type: 'boolean',
        optional: false,
        value: true
      }),
      Property.fromObject({
        name: 'stringProperty_required',
        description: 'stringPropertyDescription',
        type: 'string',
        optional: false,
        value: "Test String"
      }),
      Property.fromObject({
        name: 'decimalProperty_optional',
        description: 'decimalPropertyDescription',
        type: 'decimal',
        optional: true
      }),
      Property.fromObject({
        name: 'integerProperty_optional',
        description: 'integerPropertyDescription',
        type: 'integer',
        optional: true
      }),
      Property.fromObject({
        name: 'floatProperty_optional',
        description: 'floatPropertyDescription',
        type: 'float',
        optional: true
      }),
      Property.fromObject({
        name: 'booleanProperty_optional',
        description: 'booleanPropertyDescription',
        type: 'boolean',
        optional: true
      }),
      Property.fromObject({
        name: 'stringProperty_optional',
        description: 'stringPropertyDescription',
        type: 'string',
        optional: true
      })
    ]
  };

  withTransformerProperties(callback: (transformerProperties: Property[]) => void) {
    setTimeout(() => { callback(this.getTransformerProperties()); });
    setInterval(() => { callback(this.getTransformerProperties()); },10000);
  }
}
