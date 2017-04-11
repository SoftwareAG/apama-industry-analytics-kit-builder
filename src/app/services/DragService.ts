import {BehaviorSubject} from "rxjs";
import {AbstractDragService, Draggable, Dragged, Point} from "./AbstractDragService";

export class DragService extends AbstractDragService {
  readonly dragging: BehaviorSubject<Dragged|undefined> = new BehaviorSubject(undefined);

  startDrag(draggable: Draggable) {
    this.dragging.next(new Dragged(draggable));
  }

  stopDrag() {
    const previous = this.dragging.getValue();
    this.dragging.next(undefined);
    return previous;
  }

  drag(newLocation: Point) {
    const dragging = this.dragging.getValue();
    dragging && dragging.currentLocation.next(newLocation);
  }
}
