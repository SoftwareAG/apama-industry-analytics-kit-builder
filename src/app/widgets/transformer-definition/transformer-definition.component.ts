import {Component, ElementRef, HostListener, Input, OnInit} from "@angular/core";
import {TransformerDef} from "../../classes/TransformerDef";
import * as d3 from "d3";
import {roundedRectangle} from "../ladder-diagram/ladder-diagram.component";
import {AbstractDragService} from "../../services/AbstractDragService";
import {AbstractMetadataService} from "../../services/MetadataService";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'transformer-definition',
  templateUrl: './transformer-definition.component.html',
  styleUrls: ['./transformer-definition.component.scss']
})
export class TransformerDefinitionComponent implements OnInit {
  private readonly nativeElement;

  @Input() analytic: TransformerDef;
  @Input() width: number = 150;
  @Input() height: number = 50;

  constructor(myElement: ElementRef, private dragService: AbstractDragService, private metadataService: AbstractMetadataService, private dataService: AbstractDataService) {
    this.nativeElement = myElement.nativeElement;
  }

  ngOnInit(): void {
    const component = this;

    const padding = 8;

    const svg = d3.select(this.nativeElement).select('svg')
      .attr('width', this.width + padding * 2)
      .attr('height', this.height + padding * 2);

    const transformer = svg.append('g')
      .classed('transformer', true)
      .attr('transform', `translate(${padding},${padding})`)
      .on('mousedown', function() {
        const newAnalytic = component.metadataService.createAnalytic(component.analytic.name);
        component.dragService.startDrag({sourceElement: this as SVGGElement, object: newAnalytic});
        component.dataService.selectedTransformer.next(newAnalytic);
        d3.event.preventDefault();
      });

    const transformerBg = transformer.append('path')
      .classed('transformer-bg', true)
      .attr('d', roundedRectangle(this.width, this.height, 8));

    const transformerName = transformer.append('text')
      .classed('transformer-name no-pointer', true)
      .attr('transform', `translate(${this.width/2},${this.height/2})`)
      .attr('text-anchor', 'middle')
      .attr('dy', "0.3em")
      .text(this.analytic.name)
  }
}
