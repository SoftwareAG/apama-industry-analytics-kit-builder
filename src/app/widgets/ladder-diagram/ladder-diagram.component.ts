import {Component, ElementRef, OnInit} from "@angular/core";
import * as d3 from "d3";
import * as deepFreeze from "deep-freeze";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Config} from "../../classes/Config";
import {Row} from "../../classes/Row";
import {TransformerChannelDef} from "../../classes/TransformerChannelDef";
import {Channel} from "../../classes/Channel";
import {Observable} from "rxjs";
import {AbstractDragService, Dragged} from "../../services/AbstractDragService";
import {TransformerDef, TransformerDefBuilder} from "../../classes/TransformerDef";
import {Transformer, TransformerBuilder} from "../../classes/Transformer";

@Component({
  selector: 'ladder-diagram',
  template: ''
})
export class LadderDiagramComponent implements OnInit {
  readonly nativeElement;

  constructor(myElement: ElementRef, private readonly dataService: AbstractDataService, private readonly dragService: AbstractDragService) {
    this.nativeElement = myElement.nativeElement;
  }

  ngOnInit() {
    const component = this;

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

    function getDropTargetsForRow(row: Row, dragging: Transformer | TransformerDef): any[] {
      const maxTransformerCount = row.maxTransformerCount.getValue();
      const transformerCount = row.transformers.getValue().size;
      const transWidth = transformerWidth(maxTransformerCount);
      const rowInChannelCount = row.getInChannels().size;
      const rowOutChannelCount = row.getOutChannels().size;

      if (
        transformerCount < maxTransformerCount &&
        rowInChannelCount <= 1 && rowOutChannelCount <= 1 &&
        dragging.inputChannels.size === 1 && dragging.outputChannels.size === 1
      ) {
        return new Array(transformerCount + 1).fill(undefined).map((ignored, i) => {
          return {
            dropTargetX: transformerSpacing / 2 + (transformerSpacing + transWidth) * i - dropTargetWidth / 2,
            row: row
          }
        });
      }
      return [];
    }

    function createRowChannel(selection, type: 'input' | 'output') {
      selection
        .on('mouseup', (d, i) => {
          const dragged = component.dragService.dragging.getValue();
          if (dragged && dragged.object instanceof Channel) {
            component.dragService.stopDrag();
            d3.event.stopPropagation();
            if (type === 'input') {
              d.row.inputChannelOverrides.next(d.row.inputChannelOverrides.getValue().set(i, dragged.object));
            } else {
              d.row.outputChannelOverrides.next(d.row.outputChannelOverrides.getValue().set(i, dragged.object));
            }
          }
        })
        .on('mouseleave', function(d, i) {
          const dragging = component.dragService.dragging.getValue();
          if (dragging && d.channel === dragging.object) {
            if (type === 'input') {
              d.row.inputChannelOverrides.next(d.row.inputChannelOverrides.getValue().set(i, undefined));
            } else {
              d.row.outputChannelOverrides.next(d.row.outputChannelOverrides.getValue().set(i, undefined));
            }
          }
        })
        .on('mousedown', function(d) {
          if (d.channel instanceof Channel) {
            component.dragService.startDrag({sourceElement: this as SVGGraphicsElement, object: d.channel});
            d3.event.preventDefault();
          }
        });

      selection.append('circle')
        .call(styleChannel, 10)
        .attr('cx', 0)
        .attr('cy', 0);

      selection.append('text')
        .attr('text-anchor', type === 'input' ? 'end' : 'start')
        .attr('dx', type === 'input' ? -20 : 20)
        .attr('dy', '.3em')
    }

    function styleChannel(selection, size: number) {
      selection
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

    this.dataService.hierarchy
      .switchMap(hierarchy => hierarchy.asObservable()) // subscribe to all of the sub-tree changes too
      .combineLatest(
        this.dragService.dragging,
        (hierarchy, dragging) => hierarchy
      )
      .subscribe(data => {

        rows.datum(data);

        const row = rows.selectAll('.row').data((d: Config) => { return d.rows.getValue().toArray(); });
        row.exit().remove();
        const rowEnter = row.enter().append('g')
          .classed('row', true);
        const rowUpdate = row.merge(rowEnter);

        rowEnter.append('g')
          .classed('channels', true);

        const channelsUpdate = rowUpdate.select('.channels');

        const inChannel = channelsUpdate.selectAll('.inChannel').data((d: Row) => {
          const transWidth = transformerWidth(d.maxTransformerCount.getValue());
          const lastTransformerX = d.transformers.getValue().size ? transformerX(transWidth, d.transformers.getValue().size - 1) : transformerX(transWidth, 0);
          return d.getInChannels().toArray().map((channel) => { return { lastTransformerX: lastTransformerX, channel: channel, row: d } });
        });
        inChannel.exit().remove();
        const inChannelEnter = inChannel.enter().append('g')
          .classed('inChannel', true);
        const inChannelUpdate = inChannel.merge(inChannelEnter)
          .attr('transform', (d,i) => `translate(0,${(i+1) * defaultTransformerHeight / 2})`);

        inChannelEnter.append('line')
          .attr('stroke', 'black')
          .attr('stroke-width', 2);

        inChannelEnter.append('g')
          .classed('channel', true)
          .call(createRowChannel, 'input');

        inChannelUpdate.selectAll('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', (d: {lastTransformerX: number}) => d.lastTransformerX)
          .attr('y2', 0);

        inChannelUpdate.select('.channel').call(rowChannelUpdate);

        const outChannel = channelsUpdate.selectAll('.outChannel').data((d: Row) => {
          const transWidth = transformerWidth(d.maxTransformerCount.getValue());
          const firstTransformerX = transformerX(transWidth, 0);
          return d.getOutChannels().toArray().map((channel) => { return { firstTransformerX: firstTransformerX, channel: channel, row: d } });
        });
        outChannel.exit().remove();
        const outChannelEnter = outChannel.enter().append('g')
          .classed('outChannel', true);
        const outChannelUpdate = outChannel.merge(outChannelEnter)
          .attr('transform', (d,i) => `translate(0,${(i+1) * defaultTransformerHeight / 2})`);

        outChannelEnter.append('line')
          .attr('stroke', 'black')
          .attr('stroke-width', 2);

        outChannelEnter.append('g')
          .attr('transform', `translate(${width},0)`)
          .classed('channel', true)
          .call(createRowChannel, 'output');

        outChannelUpdate.selectAll('line')
          .attr('x1', (d: {firstTransformerX: number}) => d.firstTransformerX)
          .attr('y1', 0)
          .attr('x2', width)
          .attr('y2', 0);

        outChannelUpdate.select('.channel').call(rowChannelUpdate);

        rowEnter.append('g')
          .classed('transformers', true);

        const rowTransformersUpdate = rowUpdate.select('.transformers')
          .datum(d => { return { transformerWidth: transformerWidth(d.maxTransformerCount.getValue()), row: d } });

        const transformer = rowTransformersUpdate.selectAll('.transformer').data(d => d.row.transformers.getValue().toArray().map(transformer => { return {
          width: d.transformerWidth,
          height: transformerHeight(transformer.inputChannels.size, transformer.outputChannels.size),
          transformer: transformer,
          row: d.row
        }}));
        transformer.exit().remove();

        const transformerEnter = transformer.enter().append('g')
          .classed('transformer', true)
          .on('mouseup', (d) => {
            component.dataService.selectedTransformer.next(d.transformer);
          })
          .on('mouseleave', function(d, i) {
            const dragging = component.dragService.dragging.getValue();
            if (dragging && d.transformer === dragging.object) {
              d.row.transformers.next(d.row.transformers.getValue().remove(i));
            }
          })
          .on('mousedown', function(d) {
            component.dragService.startDrag({sourceElement: this as SVGGraphicsElement, object: d.transformer});
            d3.event.preventDefault();
          });
        const transformerUpdate = transformer.merge(transformerEnter)
          .attr('transform', (d, i) => `translate(${transformerX(d.width, i)},0)`);

        transformerEnter.append('rect')
          .attr('fill', 'steelblue')
          .attr('stroke', 'black')
          .attr('stroke-width', 2);
        transformerEnter.append('text')
          .attr('dy', '.3em')
          .attr('text-anchor', 'middle');
        transformerUpdate.select('rect')
          .attr('x', d => -d.width/2)
          .attr('y', 0)
          .attr('height', d => d.height)
          .attr('width', d => d.width);
        transformerUpdate.select('text')
          .attr('x', 0)
          .attr('y', d => d.height/2)
          .text(d => d.transformer.name);

        transformerEnter.append('g')
          .classed('transformer-inchannels', true);
        const transformerInChansUpdate = transformerUpdate.select('.transformer-inchannels')
          .attr('transform', d => `translate(${-d.width/2},0)`);
        const transformerInChan = transformerInChansUpdate.selectAll('.channel').data((d) => d.transformer.inputChannels.toArray().map((chanDef) => { return { channel: chanDef } }));
        transformerInChan.exit().remove();
        const transformerInChanEnter = transformerInChan.enter().append('circle')
          .classed('channel', true)
          .call(styleChannel, 5);
        const transformerInChanUpdate = transformerInChan.merge(transformerInChanEnter)
          .attr('cx', 0)
          .attr('cy', (d,i) => (i+1) * defaultTransformerHeight/2);

        transformerEnter.append('g')
          .classed('transformer-outchannels', true);
        const transformerOutChansUpdate = transformerUpdate.select('.transformer-outchannels')
          .attr('transform', d => `translate(${d.width/2},0)`);
        const transformerOutChan = transformerOutChansUpdate.selectAll('.channel').data((d) => d.transformer.outputChannels.toArray().map((chanDef) => { return { channel: chanDef } }));
        transformerOutChan.exit().remove();
        const transformerOutChanEnter = transformerOutChan.enter().append('circle')
          .classed('channel', true)
          .call(styleChannel, 5);
        const transformerOutChanUpdate = transformerOutChan.merge(transformerOutChanEnter)
          .attr('cx', 0)
          .attr('cy', (d,i) => (i+1) * defaultTransformerHeight/2);

        function rowChannelUpdate(selection) {
          const channelSelection = selection.filter((d: {channel: TransformerChannelDef | Channel}) => d.channel instanceof Channel);
          const channelDefSelection = selection.filter((d: {channel: TransformerChannelDef | Channel}) => d.channel instanceof TransformerChannelDef);
          channelSelection.select('text')
            .text(d => d.channel.name.getValue());
          channelDefSelection.select('text')
            .text(d => d.channel.name);

          channelSelection
            .classed('placeholder-channel', false)
              .select('circle')
              .attr('fill', 'steelblue')
              .attr('stroke-dasharray', null);

          channelDefSelection
            .classed('placeholder-channel', true)
            .select('circle')
              .attr('fill', 'white')
              .attr('stroke-dasharray', '2,2');
        }

        rowEnter.append('g')
          .classed('drop-targets', true);

        const dropTarget = rowUpdate.select('.drop-targets').selectAll('.drop-target').data((d: Row) => {
          const dragging = component.dragService.dragging.getValue();
          return dragging && (dragging.object instanceof TransformerDef || dragging.object instanceof Transformer) ? getDropTargetsForRow(d, dragging.object) : []
        });
        dropTarget.exit().remove();
        const dropTargetEnter = dropTarget.enter().append('rect')
          .classed('drop-target', true)
          .attr('fill', 'lightgrey')
          .attr('stroke-width', 2)
          .attr('stroke', 'black')
          .attr('stroke-dasharray', '2,2')
          .on('mouseup', (d, i) => {
            const dragging = component.dragService.dragging.getValue();
            if (dragging) {
              if (dragging.object instanceof Transformer) {
                d.row.transformers.next(d.row.transformers.getValue().insert(i, dragging.object));
              } else if (dragging.object instanceof TransformerDef) {
                d.row.transformers.next(d.row.transformers.getValue().insert(i, TransformerBuilder.fromTransformerDefBuilder(TransformerDefBuilder.fromJson(dragging.object.toJson())).build()));
              }
              this.dragService.stopDrag();
              d3.event.stopPropagation();
            }
          });

        const dropTargetUpdate = dropTarget.merge(dropTargetEnter)
          .attr('width', dropTargetWidth)
          .attr('height', defaultTransformerHeight)
          .attr('x', d => d.dropTargetX)
          .attr('y', 0);

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
