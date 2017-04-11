
import {BehaviorSubject} from "rxjs";
import {TransformerDef} from "app/classes/TransformerDef";
import {Channel} from "app/classes/Channel";
import {Transformer} from "../classes/Transformer";

export interface Point {
  readonly x: number;
  readonly y: number;
}

export class Dragged implements Draggable {
  readonly sourceElement: SVGGraphicsElement;
  readonly object: Channel | TransformerDef | Transformer;
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
  object: Channel|TransformerDef|Transformer;
}

export abstract class AbstractDragService {
  readonly dragging: BehaviorSubject<Dragged|undefined>;

  abstract startDrag(draggable: Draggable)
  abstract stopDrag(): Dragged | undefined
  abstract drag(newLocation: Point)
}
