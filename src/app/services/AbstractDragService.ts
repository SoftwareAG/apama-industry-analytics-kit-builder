import {BehaviorSubject} from "rxjs";
import {RowChannel} from "app/classes/Channel";
import {Transformer} from "../classes/Transformer";

export interface Point {
  readonly x: number;
  readonly y: number;
}

export class Dragged implements Draggable {
  readonly sourceElement: SVGGraphicsElement;
  readonly object: RowChannel | Transformer;
  readonly currentLocation: BehaviorSubject<Point>;

  constructor(draggable: Draggable) {
    this.sourceElement = draggable.sourceElement;
    this.object = draggable.object;
    this.currentLocation = new BehaviorSubject<Point>(this.getStartLocation());
  }

  getStartLocation(): Point {
    const bbox = this.sourceElement.getBoundingClientRect();
    return {x: bbox.left, y: bbox.top};
  }
}

export interface Draggable {
  sourceElement: SVGGraphicsElement;
  object: RowChannel|Transformer;
}

export abstract class AbstractDragService {
  readonly dragging: BehaviorSubject<Dragged|undefined> = new BehaviorSubject(undefined);

  abstract startDrag(draggable: Draggable)
  abstract stopDrag(): Dragged | undefined
  abstract drag(newLocation: Point)

  isDragging(): boolean {
    return this.dragging.getValue() !== undefined;
  }

  isDraggingClass(clazz: any) {
    const dragging = this.dragging.getValue();
    return dragging && dragging.object instanceof clazz;
  }
}
