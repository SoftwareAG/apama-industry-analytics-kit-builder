import {Component, ElementRef, OnInit} from "@angular/core";
import * as d3 from "d3";
import * as deepFreeze from "deep-freeze";
import {TransformerDef} from "../../classes/TransformerDef";
import {Observable} from "rxjs";
import {List} from "immutable";
import {AbstractDragService} from "../../services/AbstractDragService";
import {AbstractMetadataService} from "../../services/MetadataService";

@Component({
  selector: 'transformer-selector',
  template: '<svg class="transformer-selector"></svg>',
  styleUrls: ['./transformer-selector.component.css']
})
export class TransformerSelectorComponent implements OnInit {
  readonly nativeElement;
  readonly transformers: Observable<List<TransformerDef>>;
  readonly dragService: AbstractDragService;

  constructor(myElement: ElementRef, metadataService: AbstractMetadataService, dragService: AbstractDragService) {
    this.nativeElement = myElement.nativeElement;
    this.transformers = metadataService.metadata.map((metadata) => metadata.analytics);
    this.dragService = dragService;
  }

  ngOnInit() {
    const component = this;

    const padding = deepFreeze({top: 10, right: 10, bottom: 10, left: 10});
    const width = 200 - padding.left - padding.right;
    const height = 1000 - padding.top - padding.bottom;
    const transformerHeight = 50;

    const svg = d3.select(this.nativeElement).select('.transformer-selector')
      .attr('width', width + padding.left + padding.right)
      .attr('height', height + padding.top + padding.bottom);

    this.transformers.subscribe(transformerDefs => {
      const transformers = svg.selectAll('g').data(transformerDefs.toArray());
      transformers.exit().remove();
      const transformersEnter = transformers.enter().append('g')
        .classed('transformer', true)
        .classed('unselectable', true)
        .attr('transform', (d, i) => `translate(${padding.left},${padding.top + i * (transformerHeight + padding.top)})`)
        .on('mousedown', function(d) {
          component.dragService.startDrag({sourceElement: this as SVGGElement, object: d});
          d3.event.preventDefault();
        });
      const transformersUpdate = transformers.merge(transformersEnter);

      transformersEnter.append('rect')
        .attr('fill', 'steelblue')
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('width', width)
        .attr('height', transformerHeight);
      transformersEnter.append('text')
        .classed('unselectable', true)
        .attr('dy', '.3em')
        .attr('text-anchor', 'middle')
        .attr('y', transformerHeight / 2)
        .attr('x', width / 2);
      transformersUpdate.select('text')
        .text((d: TransformerDef) =>  d.name)
    });
  }

}
