import {Component} from "@angular/core";
import {RowChannel} from "../../classes/Channel";
import {SelectionService} from "../../services/SelectionService";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
  selector: 'channel-property-selector',
  templateUrl: './channel-property-selector.component.html',
  styleUrls: ['./channel-property-selector.component.scss']
})
export class ChannelPropertySelectorComponent {
  selectedChannelName: BehaviorSubject<string>;

  constructor(selectionService: SelectionService) {
    selectionService.selection.filter(selection => selection instanceof RowChannel).subscribe((selection: RowChannel) => this.selectedChannelName = selection.name);
  }
}
