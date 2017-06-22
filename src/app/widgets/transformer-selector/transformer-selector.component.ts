import {Component, ViewChild} from "@angular/core";
import {TransformerDef} from "../../classes/TransformerDef";
import {Observable} from "rxjs";
import {List, OrderedMap} from "immutable";
import {AbstractDragService} from "../../services/AbstractDragService";
import {AbstractMetadataService} from "../../services/MetadataService";
import {NgbAccordion} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'transformer-selector',
  templateUrl: './transformer-selector.component.html',
  styleUrls: ['./transformer-selector.component.scss']
})
export class TransformerSelectorComponent {
  readonly analyticsByGroup: Observable<List<{groupName: string, analytics: List<TransformerDef>}>>;
  readonly dragService: AbstractDragService;

  @ViewChild(NgbAccordion) accordion: NgbAccordion;

  constructor( private metadataService: AbstractMetadataService, dragService: AbstractDragService) {
    this.analyticsByGroup = metadataService.metadata
        .map(metadata => {
          return List(metadata.analytics
            .reduce((result: OrderedMap<string, List<TransformerDef>>, analytic: TransformerDef) => {
              return result.update(analytic.group, List<TransformerDef>(), (list: List<TransformerDef>) => list.push(analytic));
            }, OrderedMap<string, List<TransformerDef>>())
          .entrySeq()
          .map(([groupName, analytics]: [string, List<TransformerDef>]) => {
            return {groupName: groupName, analytics: analytics};
          }));
        });

    // Open the first group so that we have something to show
    this.analyticsByGroup.subscribe((analyticsByGroup) => {
      if (!analyticsByGroup.isEmpty()) {
        setTimeout(() => {
          this.accordion.activeIds = analyticsByGroup.first().groupName;
        });
      }
    });

    this.dragService = dragService;
  }
}
