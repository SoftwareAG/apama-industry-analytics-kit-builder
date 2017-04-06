import {Component, ElementRef, OnInit} from "@angular/core";
import * as d3 from "d3";
import * as deepFreeze from "deep-freeze";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Config} from "../../classes/Config";
import {Row} from "../../classes/Row";
import {TransformerChannelDef} from "../../classes/TransformerChannelDef";
import {Channel} from "../../classes/Channel";
import {Observable} from "rxjs";

@Component({
  selector: 'ladder-diagram',
  template: ''
})
export class LadderDiagramComponent implements OnInit {
  readonly nativeElement;
  readonly hierarchy: Observable<Config>;

  constructor(myElement: ElementRef, dataService: AbstractDataService) {
    this.nativeElement = myElement.nativeElement;
    this.hierarchy = dataService.hierarchy;
  }

  ngOnInit() {
    const padding = deepFreeze({top: 20, right: 200, bottom: 20, left: 200});
    const width = 1100 - padding.left - padding.right;
    const defaultTransformerHeight = 50;
    const dropTargetWidth = 40;
    const transformerSpacing = dropTargetWidth + 20;
    const rowSpacing = 10;

    const svg = d3.select(this.nativeElement).append('svg');

    function getSizeAndPos(element: SVGGraphicsElement): SVGRect {
      const bb = element.getBBox();
      const p = (svg.node() as SVGSVGElement).createSVGPoint();
      p.x = bb.x;
      p.y = bb.y;
      const pos = p.matrixTransform(element.getCTM());
      return {
        x: pos.x,
        y: pos.y,
        width: bb.width,
        height: bb.height
      }
    }

    function transformerHeight(transformerInChannelCount: number, transformerOutChannelCount: number): number {
      return Math.max(defaultTransformerHeight, (Math.max(transformerInChannelCount, transformerOutChannelCount) + 1) * defaultTransformerHeight / 2)
    }

    function transformerWidth(transformerCount: number): number {
      const totalSpacingWidth = (transformerCount + 1) * transformerSpacing;
      const totalTransformerWidth = width - totalSpacingWidth;
      return totalTransformerWidth / transformerCount;
    }

    function transformerX(transformerWidth: number, transformerIndex: number) {
      return transformerSpacing * (transformerIndex + 1) + transformerWidth * transformerIndex + transformerWidth / 2;
    }

    function styleChannel(selection, size: number) {
      selection
        .classed('channel', true)
        .attr('stroke', 'black')
        .attr('stroke-width', '2')
        .attr('fill', 'steelblue')
        .attr('r', size)
        .on('mouseenter', function(d) {
          d3.select(this)
            .classed('hover', true)
            .attr('r', size + 3);
        })
        .on('mouseleave', function(d) {
          d3.select(this)
            .classed('hover', false)
            .attr('r', size);
        });
    }

    const container = svg.append('g')
      .attr('transform', `translate(${padding.left},${padding.top})`);

    const inputLine = container.append('line')
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    const outputLine = container.append('line')
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    const rows = container.append('g')
      .classed('rows', true);

    this.hierarchy.subscribe((data: Config) => {

      rows.datum(data);

      const row = rows.selectAll('.row').data((d: Config) => { return d.rows.getValue().toArray(); });
      row.exit().remove();
      const rowEnter = row.enter().append('g')
        .classed('row', true);
      const rowUpdate = row.merge(rowEnter);

      const channels = rowEnter.append('g')
        .classed('channels', true);

      const inChannel = channels.selectAll('.inChannel').data((d: Row) => {
        const transWidth = transformerWidth(d.maxTransformerCount.getValue());
        const lastTransformerX = d.transformers.getValue().size ? transformerX(transWidth, d.transformers.getValue().size - 1) : transformerX(transWidth, 0);
        return d.getInChannels().map((channel) => { return { lastTransformerX: lastTransformerX, channel: channel } }).toArray();
      });
      inChannel.exit().remove();
      const inChannelEnter = inChannel.enter().append('g')
        .classed('inChannel', true);
      const inChannelUpdate = inChannel.merge(inChannelEnter)
        .attr('transform', (d,i) => { return `translate(0,${(i+1) * defaultTransformerHeight / 2})` });

      inChannelEnter.append('line')
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
      inChannelEnter.append('circle')
        .call(styleChannel, 10)
        .attr('cx', 0)
        .attr('cy', 0);
      inChannelEnter.append('text')
        .attr('text-anchor', 'end')
        .attr('dx', '-20')
        .attr('dy', '.3em');

      inChannelUpdate.selectAll('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d: {lastTransformerX: number}) => { return d.lastTransformerX })
        .attr('y2', 0);

      const outChannel = channels.selectAll('.outChannel').data((d: Row) => {
        const transWidth = transformerWidth(d.maxTransformerCount.getValue());
        const firstTransformerX = transformerX(transWidth, 0);
        return d.getOutChannels().map((channel) => { return { firstTransformerX: firstTransformerX, channel: channel } }).toArray();
      });
      outChannel.exit().remove();
      const outChannelEnter = outChannel.enter().append('g')
        .classed('outChannel', true);
      const outChannelUpdate = outChannel.merge(outChannelEnter)
        .attr('transform', (d,i) => { return `translate(0,${(i+1) * defaultTransformerHeight / 2})` });

      outChannelEnter.append('line')
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
      outChannelEnter.append('circle')
        .call(styleChannel, 10)
        .attr('cx', width)
        .attr('cy', 0);
      outChannelEnter.append('text')
        .attr('text-anchor', 'start')
        .attr('dx', '20')
        .attr('dy', '.3em');

      outChannelUpdate.selectAll('line')
        .attr('x1', (d: {firstTransformerX: number}) => { return d.firstTransformerX })
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', 0);

      rowEnter.append('g')
        .classed('transformers', true);

      const rowTransformers = rowUpdate.select('.transformers').datum(d => { return { transformerWidth: transformerWidth(d.maxTransformerCount.getValue()), row: d } });

      const transformer = rowTransformers.selectAll('.transformer').data(d => d.row.transformers.getValue().toArray().map(transformer => { return {
        width: d.transformerWidth,
        height: transformerHeight(transformer.inputChannels.getValue().size, transformer.outputChannels.getValue().size),
        transformer: transformer
      }}));
      transformer.exit().remove();

      const transformerEnter = transformer.enter().append('g')
        .classed('transformer', true);
      const transformerUpdate = transformer.merge(transformerEnter)
        .attr('transform', function(d, i) { return `translate(${transformerX(d.width, i)},0)` });

      transformerEnter.append('rect')
        .attr('fill', 'steelblue')
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
      transformerEnter.append('text')
        .attr('dy', '.3em')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', d => { return d.height/2; });
      transformerUpdate.select('rect')
        .attr('x', d => { return -d.width/2 })
        .attr('y', d => { return 0; })
        .attr('height', d => { return d.height; })
        .attr('width', d => { return d.width });
      transformerUpdate.select('text')
        .text(d => { return d.transformer.name.getValue() });

      transformerEnter.append('g')
        .classed('transformer-inchannels', true)
        .attr('transform', d => { return `translate(${-d.width/2},0)`});
      const transformerInChansUpdate = transformerUpdate.select('.transformer-inchannels');
      const transformerInChan = transformerInChansUpdate.selectAll('.channel').data((d) => { return d.transformer.inputChannels.getValue().toArray().map((chanDef) => { return { channel: chanDef } }); });
      transformerInChan.exit().remove();
      const transformerInChanEnter = transformerInChan.enter().append('circle').call(styleChannel, 5);
      const transformerInChanUpdate = transformerInChan.merge(transformerInChanEnter)
        .attr('cx', 0)
        .attr('cy', (d,i) => { return (i+1) * defaultTransformerHeight/2});

      transformerEnter.append('g')
        .classed('transformer-outchannels', true)
        .attr('transform', d => { return `translate(${d.width/2},0)`});
      const transformerOutChansUpdate = transformerUpdate.select('.transformer-outchannels');
      const transformerOutChan = transformerOutChansUpdate.selectAll('.channel').data((d) => { return d.transformer.outputChannels.getValue().toArray().map((chanDef) => { return { channel: chanDef } }); });
      transformerOutChan.exit().remove();
      const transformerOutChanEnter = transformerOutChan.enter().append('circle').call(styleChannel, 5);
      const transformerOutChanUpdate = transformerOutChan.merge(transformerOutChanEnter)
        .attr('cx', 0)
        .attr('cy', (d,i) => { return (i+1) * defaultTransformerHeight/2});

      function rowChannelUpdate(selection) {
        selection
          .attr('fill', 'white')
          .classed('placeholder-channel', true)
          .attr('stroke-dasharray', '2,2')
          .filter((d: {channel: TransformerChannelDef | Channel}) => { return d.channel instanceof Channel})
            .classed('placeholder-channel', false)
            .attr('fill', 'steelblue')
            .attr('stroke-dasharray', null);
      }

      inChannelUpdate.selectAll('.channel').call(rowChannelUpdate);
      outChannelUpdate.selectAll('.channel').call(rowChannelUpdate);

      inChannelUpdate.selectAll('text')
        .attr('x', 0)
        .text((d: {channel: TransformerChannelDef | Channel}) => { return d.channel.name.getValue() });
      outChannelUpdate.selectAll('text')
        .attr('x', width)
        .text((d: {channel: TransformerChannelDef | Channel}) => { return d.channel.name.getValue() });

      // Stack the rows below each other
      rowUpdate
        .attr('transform', function(d, i) {
          const prev = (this as Element).previousElementSibling as SVGGraphicsElement;
          if (prev) {
            const sizeAndPos = getSizeAndPos(prev);
            return `translate(0, ${sizeAndPos.y + sizeAndPos.height + rowSpacing})`;
          } else {
            return 'translate(0,0)';
          }
        });

      // Get the full size
      const rowsBB = getSizeAndPos(rows.node() as SVGGraphicsElement);
      const finalHeight = rowsBB.height;

      // Draw the in and out lines to be the full size
      inputLine
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', finalHeight);
      outputLine
        .attr('x1', width)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', finalHeight);

      // Resize the svg so that everything fits, the parent element can deal with scrolling
      svg
        .attr('width', width + padding.left + padding.right)
        .attr('height', finalHeight + padding.top + padding.bottom)
    });
  }

}
