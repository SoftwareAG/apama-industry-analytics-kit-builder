import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Property, PropertyBuilder} from "app/classes/Property";
import {List} from "immutable";
import {PropertyDef} from "../../classes/PropertyDef";
import {Transformer} from "../../classes/Transformer";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AbstractMetadataService} from "../../services/MetadataService";
import {SelectionService} from "../../services/SelectionService";
import {selection} from "d3-selection";

@Component({
  selector: 'transformer-property-selector',
  templateUrl: './transformer-property-selector.component.html',
  styleUrls: ['./transformer-property-selector.component.scss']
})
export class TransformerPropertySelectorComponent implements OnInit {

  readonly transformerProperties: Observable<List<{definition: PropertyDef, values: List<Property>}>>;
  readonly selectedTransformer: Observable<Transformer | undefined>;

  constructor(selectionService: SelectionService, dataService: AbstractDataService, metadataService: AbstractMetadataService) {
    this.selectedTransformer = selectionService.selection.map(selection => selection instanceof Transformer ? selection : undefined);
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
    this.selectedTransformer.first().filter(selectedTransformer => !!selectedTransformer).subscribe((selectedTransformer: Transformer) => {
      selectedTransformer.addPropertyValue(propertyDef.name, PropertyBuilder.fromPropertyDef(propertyDef).build());
    });
  }

  removePropertyValue(property: Property) {
    this.selectedTransformer.first().filter(selectedTransformer => !!selectedTransformer).subscribe((selectedTransformer: Transformer) => {
      selectedTransformer.removePropertyValue(property)
    });
  }

  removeAllPropertyValues(propertyDef: PropertyDef) {
    this.selectedTransformer.first().filter(selectedTransformer => !!selectedTransformer).subscribe((selectedTransformer: Transformer) => {
      selectedTransformer.removePropertyValuesByDefName(propertyDef.name);
    });
  }

  toggleOptional(propertyDef: PropertyDef, hasValue: boolean) {
    if (hasValue) {
      this.addPropertyValue(propertyDef);
    } else {
      this.removeAllPropertyValues(propertyDef);
    }
  }

  ngOnInit() { }
}
