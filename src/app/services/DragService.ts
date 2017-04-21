import {AbstractDragService, Draggable, Dragged, Point} from "./AbstractDragService";
import {Injectable} from "@angular/core";

@Injectable()
export class DragService extends AbstractDragService {
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
