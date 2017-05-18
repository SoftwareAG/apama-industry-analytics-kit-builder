import {Component} from "@angular/core";
import {AbstractMetadataService} from "../../services/MetadataService";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Transformer} from "../../classes/Transformer";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent {

  readonly transformerDocumentation: Observable<string>;

  constructor(private dataService: AbstractDataService, private metadataService: AbstractMetadataService) {
    // Listen for updates to selectedTransformer
    this.transformerDocumentation = this.dataService.selectedTransformer
      .filter(transformer => transformer !== undefined)
      .combineLatest(
        this.metadataService.metadata,
        (transformer: Transformer, metadata) => metadata.getAnalytic(transformer.name).documentation
      )
  }
}
