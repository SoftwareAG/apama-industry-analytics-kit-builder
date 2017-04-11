import {Component, ElementRef, OnInit} from "@angular/core";
import * as d3 from "d3";
import {Channel} from "../../classes/Channel";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Observable} from "rxjs";
import {List} from "immutable";
import {AbstractDragService} from "../../services/AbstractDragService";

@Component({
  template: '<svg class="channel-selector"></svg>',
  selector: 'channel-selector',
  styleUrls: ['./channel-selector.component.css']
})
export class ChannelSelectorComponent implements OnInit {
  readonly nativeElement;
  readonly channels: Observable<List<Channel>>;
  readonly dataService : AbstractDataService;
  readonly dragService: AbstractDragService;

  constructor(myElement: ElementRef, dataService: AbstractDataService, dragService: AbstractDragService) {
    this.nativeElement = myElement.nativeElement;
    this.dataService = dataService;
    this.channels = this.dataService.channels;
    this.dragService = dragService;
  }

  ngOnInit() {
    const component = this;

    const padding = {left:20, top: 20, right: 20, bottom: 20};
    const width = 250 - padding.left - padding.right;
    const height = 300 - padding.top - padding.bottom;
    const channelHeight = 50;

    const svg = d3.select(this.nativeElement).select(".channel-selector")
      .attr("width", width + padding.left + padding.right)
      .attr("height", height + padding.top + padding.bottom);

    const container = svg.append("g")
      .attr("transform", `translate(${padding.left},${padding.top})`);

    this.channels.subscribe((channels: List<Channel>) => {
      const groups = container.selectAll(".channel").data(channels.toArray());
      groups.exit().remove();
      const groupsEnter = groups.enter().append("g")
        .classed("channel", true)
        .on('mousedown', function(d) {
          component.dragService.startDrag({sourceElement: this as SVGGElement, object: d});
          d3.event.preventDefault();
        });
      const groupsUpdate = groups.merge(groupsEnter)
        .attr("transform", (d,i) => `translate(0,${i*60})`);

      groupsEnter.append("rect")
        .attr('width', width)
        .attr('height', channelHeight)
        .attr('fill', 'rgba(0,0,0,0)');

      groupsEnter.append("circle")
        .attr("fill", "steelblue")
        .attr("r", 20)
        .attr("cx", channelHeight/2)
        .attr("cy", channelHeight/2);
      groupsEnter.append("text")
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "left")
        .attr("dx", 25)
        .attr("x", channelHeight/2)
        .attr("y", channelHeight/2);

      groupsUpdate.select('text')
        .classed('unselectable', true)
        .text((d: Channel) => d.name.getValue());
    })
  }


}
