import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Property, PropertyBuilder} from "app/classes/Property";
import {List} from "immutable";
import {PropertyDef} from "../../classes/PropertyDef";
import {Transformer} from "../../classes/Transformer";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AbstractMetadataService} from "../../services/MetadataService";

@Component({
  selector: 'transformer-property-selector',
  templateUrl: './transformer-property-selector.component.html',
  styleUrls: ['./transformer-property-selector.component.css']
})
export class TransformerPropertySelectorComponent implements OnInit {

  readonly transformerProperties: Observable<List<{definition: PropertyDef, values: List<Property>}>>;
  readonly selectedTransformer: BehaviorSubject<Transformer | undefined>;

  constructor(dataService: AbstractDataService, metadataService: AbstractMetadataService) {
    this.selectedTransformer = dataService.selectedTransformer;
    const metadata = metadataService.metadata;

    this.transformerProperties = this.selectedTransformer // Track the selectedTransformer changes
      .switchMap((selectedTransformer) => selectedTransformer ? selectedTransformer.propertyValuesByDefName.mapTo(selectedTransformer) : Observable.of(undefined)) // Track additions/removals from the propertyValues Map
      .combineLatest(
        metadata,
        dataService.hierarchy,
        (selectedTransformer, metadata, hierarchy) => selectedTransformer ? metadata.getAnalytic(selectedTransformer.name).properties.map((propertyDef: PropertyDef) => {
          return { definition: propertyDef, values: selectedTransformer.getPropertyValues(propertyDef.name) }
        }) : List()
      );
  }

  addPropertyValue(propertyDef: PropertyDef) {
    const selectedTransformer = this.selectedTransformer.getValue();
    if (selectedTransformer) {
      selectedTransformer.addPropertyValue(propertyDef.name, PropertyBuilder.fromPropertyDef(propertyDef).build());
    }
  }

  removePropertyValue(property: Property) {
    const selectedTransformer = this.selectedTransformer.getValue();
    if (selectedTransformer) {
      selectedTransformer.removePropertyValue(property)
    }
  }

  ngOnInit() { }
}
