import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Property, PropertyBuilder} from "app/classes/Property";
import {List} from "immutable";
import {PropertyDef} from "../../classes/PropertyDef";
import {Transformer} from "../../classes/Transformer";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
  selector: 'transformer-property-selector',
  templateUrl: './transformer-property-selector.component.html',
  styleUrls: ['./transformer-property-selector.component.css']
})
export class TransformerPropertySelectorComponent implements OnInit {

  readonly transformerProperties: Observable<List<{definition: PropertyDef, values: List<Property>}>>;
  readonly selectedTransformer: BehaviorSubject<Transformer | undefined>;



  constructor(dataService: AbstractDataService) {
    this.selectedTransformer = dataService.selectedTransformer;

    this.transformerProperties = this.selectedTransformer
      .map(transformer => transformer ? transformer.properties : List<PropertyDef>())
      .combineLatest(
        this.selectedTransformer.switchMap(transformer => transformer ? transformer.propertyValues : Observable.of(List<Property>())),
        (propertyDefs, propertyVals) => {
          return propertyDefs.map((propertyDef: PropertyDef) => {
            return { definition: propertyDef, values: propertyVals.filter((propertyVal: Property) => propertyVal.definitionName === propertyDef.name) };
          })
        }
      );
  }

  addPropertyValue(propertyDef) {
    const selectedTransformer = this.selectedTransformer.getValue();
    if (selectedTransformer) {
      selectedTransformer.propertyValues.next(selectedTransformer.propertyValues.getValue().push(PropertyBuilder.fromPropertyDefBuilder(propertyDef).build()))
    }
  }

  removePropertyValue(property: Property) {
    const selectedTransformer = this.selectedTransformer.getValue();
    if (selectedTransformer) {
      selectedTransformer.propertyValues.next(selectedTransformer.propertyValues.getValue().filter(p => p !== property) as List<Property>)
    }
  }

  ngOnInit() { }
}
