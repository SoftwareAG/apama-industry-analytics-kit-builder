import {Component, ElementRef, OnInit} from "@angular/core";
import * as d3 from "d3";
import * as deepFreeze from "deep-freeze";
import {TransformerDef} from "../../classes/TransformerDef";
import {Observable} from "rxjs";
import {AbstractDataService} from "../../services/AbstractDataService";

@Component({
  selector: 'transformer-selector',
  template: ''
})
export class TransformerSelectorComponent implements OnInit {
  readonly nativeElement;
  readonly transformers: Observable<TransformerDef[]>;

  constructor(myElement: ElementRef, dataService: AbstractDataService) {
    this.nativeElement = myElement.nativeElement;
    this.transformers = dataService.transformers;
  }

  ngOnInit() {
    const padding = deepFreeze({top: 10, right: 10, bottom: 10, left: 10});
    const width = 200 - padding.left - padding.right;
    const height = 500 - padding.top - padding.bottom;
    const transformerHeight = 50;

    const svg = d3.select(this.nativeElement).append('svg')
      .attr('width', width + padding.left + padding.right)
      .attr('height', height + padding.top + padding.bottom);

    this.transformers.subscribe(transformerDefs => {
      const transformers = svg.selectAll('g').data(transformerDefs);
      transformers.exit().remove();
      const transformersEnter = transformers.enter().append('g')
        .classed('transformer', true)
        .attr('transform', (d, i) => {
          return `translate(${padding.left},${padding.top + i * (transformerHeight + padding.top)})`;
        });
      const transformersUpdate = transformers.merge(transformersEnter);

      transformersEnter.append('rect')
        .attr('fill', 'steelblue')
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('width', width)
        .attr('height', transformerHeight);
      transformersEnter.append('text')
        .attr('dy', '.3em')
        .attr('text-anchor', 'middle')
        .attr('y', transformerHeight / 2)
        .attr('x', width / 2);
      transformersUpdate.select('text')
        .text((d: TransformerDef) =>  d.name.getValue())
    });
  }

}
