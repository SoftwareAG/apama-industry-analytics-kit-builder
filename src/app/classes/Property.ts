import {PropertyDef, PropertyDefBuilder, PropertyDefInterface} from "./PropertyDef";
import {NestedClassBuilder, ClassArrayBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";

export interface PropertyInterface extends PropertyDefInterface {
  value?: number | string | boolean;
}

export class Property extends PropertyDef implements AsObservable, BehaviorSubjectify<PropertyInterface> {
  readonly value: BehaviorSubject<number | string | boolean | undefined>;

  constructor(obj: PropertyInterface) {
    super(obj);
    this.value = new BehaviorSubject(obj.value);
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      super.asObservable(),
      this.value
    ).mapTo(this);
  }
}

export class PropertyBuilder extends PropertyDefBuilder implements PropertyInterface {
  value?: number | string | boolean;

  Value(value:  number | string | boolean): this {
    this.value = value;
    return this;
  }

  build(): Property {
    return new Property(this);
  }
}

export class NestedPropertyBuilder<Parent> extends PropertyBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (property: Property) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class PropertyArrayBuilder extends ClassArrayBuilder<Property, NestedPropertyBuilder<PropertyArrayBuilder>> {
  constructor() {
    super(NestedPropertyBuilder);
  }
}
