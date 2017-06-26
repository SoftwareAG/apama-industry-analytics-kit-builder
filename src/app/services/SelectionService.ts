import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Transformer} from "../classes/Transformer";
import {RowChannel} from "../classes/Channel";

export class SelectionService {
  readonly selection: BehaviorSubject<RowChannel|Transformer|undefined> = new BehaviorSubject(undefined);

  get isSelected(): boolean {
    return !!this.selection.getValue();
  }

  get currentSelection(): RowChannel|Transformer|undefined {
    return this.selection.getValue();
  }
}
