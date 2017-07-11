import {Component} from "@angular/core";
import {AbstractMetadataService} from "../../services/MetadataService";
import {Transformer} from "../../classes/Transformer";
import {Observable} from "rxjs/Observable";
import {SelectionService} from "../../services/SelectionService";

@Component({
  selector: 'information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent {

  readonly transformerDocumentation: Observable<string>;

  constructor(private selectionService: SelectionService, private metadataService: AbstractMetadataService) {
    // Listen for updates to selectedTransformer
    this.transformerDocumentation = this.selectionService.selection
      .filter(transformer => transformer instanceof Transformer)
      .combineLatest(
        this.metadataService.metadata,
        (transformer: Transformer, metadata) => metadata.getAnalytic(transformer.name).documentation
      )
  }
}
