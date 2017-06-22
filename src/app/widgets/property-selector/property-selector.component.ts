import {Component} from "@angular/core";
import {SelectionService} from "../../services/SelectionService";
import {RowChannel} from "../../classes/Channel";
import {Transformer} from "../../classes/Transformer";

@Component({
  selector: 'property-selector',
  templateUrl: './property-selector.component.html',
  styleUrls: ['./property-selector.component.scss']
})
export class PropertySelectorComponent {
  propertiesType: string;
  analyticName: string;

  constructor(selectionService: SelectionService) {
    selectionService.selection.subscribe(selection => {
      if (selection instanceof RowChannel) {
        this.propertiesType = "Channel";
        this.analyticName = "";
      } else if (selection instanceof Transformer) {
        this.propertiesType = "Analytic";
        this.analyticName = selection.name;
      } else {
        this.propertiesType = "";
        this.analyticName = "";
      }
    });
  }
}
