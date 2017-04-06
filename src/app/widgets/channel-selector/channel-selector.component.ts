import {Component, ElementRef, OnInit} from "@angular/core";
import * as d3 from "d3";
import {Channel} from "../../classes/Channel";
import {Observable} from "rxjs";
import {AbstractDataService} from "../../services/AbstractDataService";

@Component({
  template: '',
  selector: 'channel-selector'
})
export class ChannelSelectorComponent implements OnInit {
  readonly nativeElement;
  readonly channels: Observable<Channel[]>;

  constructor(myElement: ElementRef, dataService: AbstractDataService) {
    this.nativeElement = myElement.nativeElement;
    this.channels = dataService.channels;
  }

  ngOnInit() {

    const svg = d3.select(this.nativeElement).append('svg')
      .attr("width", 800)
      .attr("height", 800);

    this.channels.subscribe((channels: Channel[]) => {
      const groups = svg.selectAll("g").data(channels);
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
        .attr("text-anchor",  "middle")
        .attr("x", (d: Channel, i) => { return i + 100; });

      groupsUpdate.select('text')
        .text((d: Channel) => { return d.name.getValue(); });
    })
  }


}
