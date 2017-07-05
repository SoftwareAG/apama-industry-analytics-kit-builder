import {Component, OnInit} from "@angular/core";
import {HistoryService} from "../../services/HistoryService";

@Component({
  selector: 'history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  constructor(public historyService: HistoryService) { }

  ngOnInit() {
  }

  onUndoClick() {
    this.historyService.undo();
  }

  onRedoClick() {
    this.historyService.redo();
  }

}
