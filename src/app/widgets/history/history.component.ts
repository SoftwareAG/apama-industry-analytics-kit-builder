import {Component, OnInit} from "@angular/core";
import {HistoryService} from "../../services/HistoryService";
import {SelectionService} from "../../services/SelectionService";

@Component({
  selector: 'history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {

  constructor(public historyService: HistoryService, private selectionService: SelectionService) { }

  onUndoClick() {
    this.selectionService.selection.next(undefined);
    this.historyService.undo();
  }

  onRedoClick() {
    this.selectionService.selection.next(undefined);
    this.historyService.redo();
  }

}
