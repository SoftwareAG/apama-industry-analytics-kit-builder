import {Component} from "@angular/core";
import {SelectionService} from "../../services/SelectionService";
import {RowChannel} from "../../classes/Channel";
import {Transformer} from "../../classes/Transformer";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'property-selector',
  templateUrl: './property-selector.component.html',
  styleUrls: ['./property-selector.component.scss']
})
export class PropertySelectorComponent {
  propertiesType: string;
  name?: Observable<string>;

  constructor(selectionService: SelectionService) {
    selectionService.selection.subscribe(selection => {
      if (selection instanceof RowChannel) {
        this.propertiesType = "Channel";
        this.name = selection.name;
      } else if (selection instanceof Transformer) {
        this.propertiesType = "Analytic";
        this.name = Observable.of(selection.name);
      } else {
        this.propertiesType = "";
        this.name = undefined;
      }
    });
  }
}
