import {Component, ElementRef, OnInit} from "@angular/core";
import * as d3 from "d3";
import {Channel} from "../../classes/Channel";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Observable} from "rxjs";
import {List} from "immutable";

@Component({
  template: '',
  selector: 'channel-selector'
})
export class ChannelSelectorComponent implements OnInit {
  readonly nativeElement;
  readonly channels: Observable<List<Channel>>;
  readonly dataService : AbstractDataService;

  constructor(myElement: ElementRef, dataService: AbstractDataService) {
    this.nativeElement = myElement.nativeElement;
    this.dataService = dataService;
    this.channels = this.dataService.channels;
  }

  ngOnInit() {

    const svg = d3.select(this.nativeElement).append('svg')
      .attr("width", 250)
      .attr("height", 300);

    this.channels.subscribe((channels: List<Channel>) => {
      const groups = svg.selectAll("g").data(channels.toArray());
      groups.exit().remove();
      const groupsEnter = groups.enter().append("g")
        .classed("channel", true)
        .attr("transform", (d, i) => { return `translate(${i + 40},${60 * i + 40})`; });
      const groupsUpdate = groups.merge(groupsEnter);

       groupsEnter.append("circle")
        .attr("fill", "steelblue")
        .attr("r", 20)
        .on('mouseover', function() { d3.select(this).attr("fill", "red");})
        .on('mouseout', function() { d3.select(this).attr("fill", "steelblue")});
      groupsEnter.append("text")
        .attr("alignment-baseline", "middle")
        .attr("text-anchor",  "left")
        .attr("dx", 25);

      groupsUpdate.select('text')
        .text((d: Channel) => d.name.getValue());
    })
  }


}
