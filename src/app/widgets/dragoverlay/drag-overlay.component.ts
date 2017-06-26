import {Component, ElementRef, HostListener, OnInit} from "@angular/core";
import {AbstractDragService, Dragged} from "../../services/AbstractDragService";
import * as d3 from "d3";
import {SelectionService} from "../../services/SelectionService";

@Component({
  templateUrl: './drag-overlay.component.html',
  styleUrls: ['./drag-overlay.component.scss'],
  selector: 'drag-overlay'
})
export class DragOverlayComponent implements OnInit {
  private readonly nativeElement: Element;

  private overlay;
  private overlayNode: SVGSVGElement;

  private currentTransition = null;

  constructor(myElement: ElementRef, private readonly dragService: AbstractDragService, private selectionService: SelectionService) {
    this.nativeElement = myElement.nativeElement;
  }

  ngOnInit(): void {
    const overlay = this.overlay = d3.select(this.nativeElement).select('svg');
    this.overlayNode = overlay.node() as SVGSVGElement;
    overlay
      .classed('drag-overlay', true)
      .attr('height', '100%')
      .attr('width', '100%')
      .style('pointer-events', 'none')
      .style('position', 'fixed')
      .style('top', '0')
      .style('left', '0')
      .style('z-index', 99999)
      .attr('opacity', 0.3);

    this.dragService.dragging
      .filter(dragging => !dragging)
      .subscribe(() => {
        (this.currentTransition || overlay.selectAll('.draggable'))
          .transition().duration(0)
          .on('end', function() { overlay.selectAll('.draggable').remove() });
        this.currentTransition = null;
      });

    this.dragService.dragging
      .filter(dragging => !!dragging)
      .subscribe((dragging: Dragged) => {
        overlay
          .append(() => dragging.sourceElement.cloneNode(true) as SVGGraphicsElement).datum(dragging)
            .classed('draggable', true)
            .attr('opacity', 1)
            .attr('transform', `translate(${dragging.currentLocation.getValue().x},${dragging.currentLocation.getValue().y})`)
      });

    this.dragService.dragging
      .filter((dragging) => { return !!dragging})
      .switchMap((dragging: Dragged) => dragging.currentLocation)
      .subscribe((currentLocation) => {
        overlay.select('.draggable')
          .attr('transform', `translate(${currentLocation.x},${currentLocation.y})`);
      });
  }

  @HostListener('document:mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    const dragging = this.dragService.dragging.getValue();
    if (dragging) {
      this.dragService.drag({x: event.x + dragging.offset.x, y: event.y + dragging.offset.y});
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseup(event: MouseEvent) {
    this.currentTransition = this.overlay.selectAll('.draggable')
      .transition("Dropped").duration(500)
        .attr('transform', (d: Dragged) => `translate(${d.getStartLocation().x},${d.getStartLocation().y})`)
        .attr('opacity', 0);
    if (this.dragService.isDragging()) {
      this.selectionService.selection.next(undefined);
    }
    this.dragService.stopDrag();
  }
}
