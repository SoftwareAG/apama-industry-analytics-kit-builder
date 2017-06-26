import {Component, ElementRef, HostListener, OnInit} from "@angular/core";
import * as d3 from "d3";
import * as deepFreeze from "deep-freeze";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Config} from "../../classes/Config";
import {Row, RowBuilder} from "../../classes/Row";
import {TransformerChannel} from "../../classes/TransformerChannel";
import {RowChannel, RowChannelBuilder} from "../../classes/Channel";
import {AbstractDragService} from "../../services/AbstractDragService";
import {Transformer} from "../../classes/Transformer";
import {AbstractMetadataService} from "../../services/MetadataService";
import {TransformerChannelDef} from "../../classes/TransformerChannelDef";
import {List} from "immutable";
import {Path} from "d3-path";
import {BaseType, Selection} from "d3-selection";
import {DataService} from "../../services/DataService";
import {SelectionService} from "../../services/SelectionService";

@Component({
  selector: 'ladder-diagram',
  templateUrl: './ladder-diagram.component.html',
  styleUrls: ['./ladder-diagram.component.scss']
})
export class LadderDiagramComponent implements OnInit {
  readonly nativeElement;

  constructor(myElement: ElementRef, private readonly dataService: AbstractDataService, private readonly selectionService: SelectionService, private readonly dragService: AbstractDragService, private readonly metadataService: AbstractMetadataService) {
    this.nativeElement = myElement.nativeElement;
  }

  ngOnInit() {
    const component = this;

    const maxTransformerCount = 4;
    const padding = deepFreeze({top: 20, right: 200, bottom: 20, left: 200});
    const width = 1100 - padding.left - padding.right;
    const transformerWidth = 150;
    const dropTargetWidth = 40;
    const rowSpacing = 10;
    const channelSpacing = 40;

    const svg = d3.select(this.nativeElement).select('svg');

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

    const container = svg.append('g')
      .attr('transform', `translate(${padding.left},${padding.top})`);

    const inputLine = container.append('line')
      .attr('stroke', 'rgba(0,0,0,0.3)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '2,2');

    const outputLine = container.append('line')
      .attr('stroke', 'rgba(0,0,0,0.3)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '2,2');

    const rows = container.append('g')
      .classed('rows', true);

    const rowPlaceholder = rows.append('g')
      .classed('row-placeholder', true);

    rowPlaceholder.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', width)
      .attr('y2', 0)
      .attr('transform', `translate(0, ${channelSpacing})`)
      .attr('stroke-width', 2)
      .attr('stroke', 'black');

    rowPlaceholder.append('path')
      .classed('drop-target', true)
      .attr('transform', `translate(${(width - transformerWidth)/2}, 0)`)
      .attr('d', roundedRectangle(transformerWidth, 2 * channelSpacing, 8))
      .on('mouseup', (d, i) => {
        const dragging = component.dragService.dragging.getValue();
        if (dragging) {
          if (dragging.object instanceof Transformer) {
            const rows = this.dataService.hierarchy.getValue().rows;
            rows.next(rows.getValue().push(new RowBuilder().pushTransformer(dragging.object).build()));
            this.dragService.stopDrag();
            d3.event.stopPropagation();
          }
        }
      });

    this.dataService.hierarchy
      .switchMap(hierarchy => hierarchy.asObservable()) // subscribe to all of the sub-tree changes too
      .combineLatest(
        this.dragService.dragging,
        this.metadataService.metadata,
        this.selectionService.selection,
        (hierarchy) => hierarchy
      )
      .subscribe(data => {

        rows.datum(data);

        const row = rows.selectAll('.row').data((d: Config) => d.rows.getValue().toArray().map(row => { return {row: row, channelWidth: channelWidth(row.transformers.getValue().size + 1)} }));
        row.exit().remove();
        const rowEnter = row.enter().append('g')
          .classed('row', true);
        const rowUpdate = row.merge(rowEnter);

        const channelsEnter = rowEnter.append('g')
          .classed('channels', true);
        const channelsUpdate = rowUpdate.select('.channels').datum(d => {
          return createChannelConnections(d.row).map((channelGroup, i, channelConnections) => { return { row: d.row, channelGroup:channelGroup, channelWidth: d.channelWidth } })
        });

        const channelGroupsEnter = channelsEnter.append('g')
          .classed('channel-groups', true);
        const channelGroupsUpdate = channelsUpdate.select('.channel-groups');

        const channelGroup = channelGroupsUpdate.selectAll('.channel-group').data(d => d);
        channelGroup.exit().remove();
        const channelGroupEnter = channelGroup.enter().append('g')
          .classed('channel-group', true);
        const channelGroupUpdate = channelGroupEnter.merge(channelGroup)
          .attr('transform', (d, i, channelGroupsSelection) => `translate(${channelX(i, d.channelWidth)}, 0)`);

        const channelPath = channelGroupUpdate.selectAll('.channel-path').data((d, i) => {
          const channelWidth = d.channelWidth;
          return d.channelGroup.map(d => { return { channelWidth: channelWidth, channelConnection: d }})
        });
        channelPath.exit().remove();
        const channelPathEnter = channelPath.enter().append('path')
          .attr('transform', `translate(0,${channelSpacing})`)
          .classed('channel-path', true);
        const channelPathUpdate = channelPath.merge(channelPathEnter)
          .attr('d', (d: any) => drawChannelConnection(d3.path(), {x: 0, y: d.channelConnection.startY }, { x: d.channelWidth, y: d.channelConnection.endY } ).toString())
          .attr('fill', 'none')
          .attr('stroke', 'black')
          .attr('stroke-width', 2);

        const rowChannelsEnter = channelsEnter.append('g')
          .classed('row-channels', true);
        const rowChannelsUpdate = channelsUpdate.select('.row-channels');

        const rowInputChannel = rowChannelsUpdate.selectAll('.row-input-channel').data(d => {
          const rowInputChannels = d[0];
          if (!rowInputChannels) { return [] }
          const rowChannels = rowInputChannels.row.getInChannels(component.metadataService.metadata.getValue());
          return rowInputChannels.channelGroup.map((channelLocation, channelIndex) => { return {type: 'input' as 'input', location: channelLocation, channel: rowChannels.get(channelIndex), row: rowInputChannels.row} })
        });
        rowInputChannel.exit().remove();
        const rowInputChannelEnter = rowInputChannel.enter().append('g')
          .call(buildRowChannel, "input");
        const rowInputChannelUpdate = rowInputChannel.merge(rowInputChannelEnter)
          .classed('selected', (d) => component.selectionService.currentSelection === d.channel)
          .attr('transform', d => `translate(0,${d.location.startY + channelSpacing})`)
          .call(updateRowChannel);

        const rowOutputChannel = rowChannelsUpdate.selectAll('.row-output-channel').data(d => {
          if (!d.length) { return [] }
          const rowOutputChannels = d[d.length -1];
          const rowChannels = rowOutputChannels.row.getOutChannels(component.metadataService.metadata.getValue());
          return rowOutputChannels.channelGroup.map((channelLocation, channelIndex) => { return {type: 'output' as 'output', location: channelLocation, channel: rowChannels.get(channelIndex), row: rowOutputChannels.row} })
        });
        rowOutputChannel.exit().remove();
        const rowOutputChannelEnter = rowOutputChannel.enter().append('g')
          .call(buildRowChannel, "output");
        const rowOutputChannelUpdate = rowOutputChannel.merge(rowOutputChannelEnter)
          .classed('selected', (d) => component.selectionService.currentSelection === d.channel)
          .attr('transform', d => `translate(${width},${d.location.endY + channelSpacing})`)
          .call(updateRowChannel);

        function buildRowChannel(rowChannelEnter: Selection<BaseType, {type: 'input' | 'output', location: any, channel: RowChannel | TransformerChannel, row: Row, mousedownHandler?: {callback:() => any, timeout: any}}, any, any>, type: "input" | "output") {
          rowChannelEnter
            .classed(`row-channel row-${type}-channel`, true)
            .classed('grabbable', true)
            .on('mouseup', (d, i) => {
              d3.event.stopPropagation();
              function selectChannel(channel: RowChannel) {
                component.selectionService.selection.next(channel);
                // If the channel name is empty, or the same as the default name, then delete the RowChannel
                component.selectionService.selection.skip(1).first().subscribe(() => {
                  const channelName = channel.name.getValue();
                  if (d.type === 'input') {
                    if (!channelName || channelName === d.row.transformers.getValue().first().inputChannels.get(i).name) {
                      d.row.removeInputChannelOverride(i);
                    }
                  } else {
                    if (!channelName || channelName === d.row.transformers.getValue().last().outputChannels.get(i).name) {
                      d.row.removeOutputChannelOverride(i);
                    }
                  }
                });
              }
              function updateChannel(channel: RowChannel, row: Row, channelNumber: number, type: 'input' | 'output') {
                if (type === 'input') {
                  row.addInputChannelOverride(channelNumber, channel);
                } else {
                  row.addOutputChannelOverride(channelNumber, channel);
                }
              }

              if (d.mousedownHandler) {
                clearTimeout(d.mousedownHandler.timeout);
                if (d.channel instanceof RowChannel) {
                  selectChannel(d.channel);
                } else {
                  const channel = new RowChannelBuilder().Name(d.channel.name).build();
                  updateChannel(channel, d.row, i, d.type);
                  selectChannel(channel);
                }
                d.mousedownHandler = undefined;
              } else {
                const dragged = component.dragService.dragging.getValue();
                if (dragged && dragged.object instanceof RowChannel) {
                  const draggedChannel = dragged.object;
                  component.dragService.stopDrag();
                  updateChannel(draggedChannel, d.row, i, d.type);
                  selectChannel(draggedChannel);
                }
              }
            })
            .on('mouseleave', function(d) {
              if (d.mousedownHandler) {
                clearTimeout(d.mousedownHandler.timeout);
                d.mousedownHandler.callback();
              }
            })
            .on('mousedown', function(d) {
              const channel = d.channel instanceof RowChannel ? d.channel.clone() : new RowChannelBuilder().Name(d.channel.name).build();
              const mousedownCallback = () => {
                d.mousedownHandler = undefined;
                component.dragService.startDrag({sourceElement: this as SVGGElement, object: channel});
              };
              d.mousedownHandler = {
                callback: mousedownCallback,
                timeout: setTimeout(mousedownCallback, 250)
              };
              d3.event.preventDefault();
            });

          rowChannelEnter.append('rect')
            .attr('width', 300)
            .attr('height', channelSpacing)
            .attr('transform', `translate(${type === 'input' ? -290 : -10}, ${-channelSpacing/2})`)
            .attr('fill', 'rgba(0,0,0,0)')
            .attr('stroke', 'none');

          rowChannelEnter.append('circle')
            .classed('channel-circle', true)
            .attr('r', 8)
            .attr('stroke', 'black')
            .attr('stroke-width', '2');

          rowChannelEnter.append('text')
            .classed('channel-name', true)
            .classed('unselectable', true)
            .attr('text-anchor', type === "input" ? "end": "start")
            .attr('dx', type === "input" ? -12: 12)
            .attr('dy', "0.3em")
        }

        function updateRowChannel(rowChannelUpdate: Selection<BaseType, {type: 'input' | 'output', location: any, channel: RowChannel | TransformerChannel, row: Row}, any, any>) {
          rowChannelUpdate.select('.channel-name')
            .text(d => d.channel.toJson().name);
        }

        const transformersEnter = rowEnter.append('g')
          .classed('transformers', true);
        transformersEnter.exit().remove();
        const transformersUpdate = rowUpdate.select('.transformers');

        const transformer = transformersUpdate.selectAll('.transformer').data(d => d.row.transformers.getValue().toArray().map(transformer => {return {row: d.row, transformer: transformer, channelWidth: d.channelWidth} as {row: Row, transformer: Transformer, channelWidth: number, mousedownHandler?: {callback:() => any, timeout: any}} }));
        transformer.exit().remove();
        const transformerEnter = transformer.enter().append('g')
          .classed('transformer', true)
          .classed('grabbable', true)
          .on('mouseup', function(d) {
            d3.event.stopPropagation();
            component.dragService.stopDrag();
            if (d.mousedownHandler) {
              clearTimeout(d.mousedownHandler.timeout);
              d.mousedownHandler = undefined;
            }
            component.selectionService.selection.next(d.transformer);
          })
          .on('mouseenter', function(d) {
            const transformer = d3.select(this);
            transformer.selectAll('.channel-name').attr('display', null);
            transformer.selectAll('.channel-add-remove').attr('display', null);
            transformer.select('.transformer-name').attr('display', 'none');
            transformer.selectAll('.channel-circle').transition().attr('r', 8);
          })
          .on('mouseleave', function(d) {
            if (d.mousedownHandler) {
              clearTimeout(d.mousedownHandler.timeout);
              d.mousedownHandler.callback();
            }
            const transformer = d3.select(this);
            transformer.selectAll('.channel-name').attr('display', 'none');
            transformer.selectAll('.channel-add-remove').attr('display', 'none');
            transformer.select('.transformer-name').attr('display', null);
            transformer.selectAll('.channel-circle').transition().attr('r', 3);
            const dragging = component.dragService.dragging.getValue();
            if (dragging && d.transformer === dragging.object) {
              d.row.removeTransformer(d.transformer);
              if (d.row.transformers.getValue().size === 0) {
                component.dataService.hierarchy.getValue().removeRow(d.row);
              }
            }
          })
          .on('mousedown', function(d) {
            const mousedownCallback = () => {
              d.mousedownHandler = undefined;
              component.dragService.startDrag({sourceElement: this as SVGGraphicsElement, object: d.transformer});
            };
            d.mousedownHandler = {
              callback: mousedownCallback,
              timeout: setTimeout(mousedownCallback, 250)
            };
            d3.event.preventDefault();
          });
        const transformerUpdate = transformer.merge(transformerEnter)
          .classed('selected', (d) => component.selectionService.currentSelection === d.transformer)
          .attr('transform', (d, i, transformersSelection) => `translate(${transformerLocation(i, transformersSelection.length, d.channelWidth)},0)`);

        const transformerBgEnter = transformerEnter.append('path')
          .classed('transformer-bg', true);
        const transformerBgUpdate = transformerUpdate.select('.transformer-bg')
          .attr('d', d => roundedRectangle(transformerWidth, transformerHeight(d.transformer), 8));

        const transformerInChannelsEnter = transformerEnter.append('g')
          .classed('transformer-inchannels', true);

        const transformerOutChannelsEnter = transformerEnter.append('g')
          .classed('transformer-outchannels', true);

        const transformerInChannelsUpdate = transformerUpdate.select('.transformer-inchannels');
        const transformerOutChannelsUpdate = transformerUpdate.select('.transformer-outchannels')
          .attr('transform', `translate(${transformerWidth}, 0)`);

        const transformerInChannel = transformerInChannelsUpdate.selectAll('.transformer-channel').data(d => getTransformerInputChannelConnections(d.transformer).map(channel => { return { transformer: d.transformer, channel: channel } }));
        transformerInChannel.exit().remove();
        const transformerInChannelEnter = transformerInChannel.enter().append('g').call(buildTransformerChannel, "input");
        const transformerInChannelUpdate = transformerInChannel.merge(transformerInChannelEnter).call(updateTransformerChannel, "input");
        const transformerOutChannel = transformerOutChannelsUpdate.selectAll('.transformer-channel').data(d => getTransformerOutputChannelConnections(d.transformer).map(channel => { return { transformer: d.transformer, channel: channel } }));
        transformerOutChannel.exit().remove();
        const transformerOutChannelEnter = transformerOutChannel.enter().append('g').call(buildTransformerChannel, "output");
        const transformerOutChannelUpdate = transformerOutChannel.merge(transformerOutChannelEnter).call(updateTransformerChannel, "output");

        function buildTransformerChannel(transformerChannelEnter: Selection<SVGGElement, {transformer: Transformer, channel: TransformerChannel | TransformerChannelDef}, any, any>, type:"input" | "output"){
          transformerChannelEnter
            .classed('transformer-channel', true);

          transformerChannelEnter.append('circle')
            .classed('channel-circle', true)
            .attr('r', 3)
            .on('mouseup', function(d) {
              // Cancel the drag timeout before adding/removing the channel, otherwise the diagram is redrawn and the event doesn't bubble
              const transformerDatum = d3.select(findParentNodeWithClass(this as Element, 'transformer')).datum() as any;
              clearTimeout(transformerDatum.mousedownHandler.timeout);
              transformerDatum.mousedownHandler = undefined;

              if (d.channel instanceof TransformerChannelDef) {
                if (type === "input") {
                  d.transformer.addInputChannelFromDef(d.channel);
                } else {
                  d.transformer.addOutputChannelFromDef(d.channel);
                }
              } else {
                const transformerDef = component.metadataService.getAnalytic(d.transformer.name);
                const channelDef = type === "input" ? transformerDef.getInputChannel(d.channel.name) : transformerDef.getOutputChannel(d.channel.name);
                if (channelDef.repeated || channelDef.optional) {
                  if (type === "input") {
                    d.transformer.removeInputChannel(d.channel);
                  } else {
                    d.transformer.removeOutputChannel(d.channel);
                  }
                }
              }
            });

          transformerChannelEnter.append('text')
            .classed('channel-name', true)
            .attr('display', 'none')
            .attr('text-anchor', type === "input" ? "start": "end")
            .attr('dx', type === "input" ? 12: -12)
            .attr('font-size', 10)
            .attr('dy', "0.3em");

          transformerChannelEnter.append('text')
            .classed('channel-add-remove no-pointer', true)
            .attr('display', 'none')
            .attr('text-anchor', 'middle')
            .attr('dy', "0.25em")
            .attr('font-weight', 'bold');
        }

        function updateTransformerChannel(transformerChannelUpdate: Selection<SVGGElement, {transformer: Transformer, channel: TransformerChannel | TransformerChannelDef}, any, any>, type:"input" | "output"){
          transformerChannelUpdate
            .attr('transform', (d, i) => `translate(0, ${channelY(i) + channelSpacing})`);

          transformerChannelUpdate.select('.channel-name')
            .text(d => d.channel.name);

          transformerChannelUpdate.select('.channel-circle')
            .classed('placeholder', d => d.channel instanceof TransformerChannelDef);

          transformerChannelUpdate.select('.channel-add-remove')
            .text(d => {
              if (d.channel instanceof TransformerChannelDef) {
                return '+';
              } else {
                const transformerDef = component.metadataService.getAnalytic(d.transformer.name);
                const channelDef = type === "input" ? transformerDef.getInputChannel(d.channel.name) : transformerDef.getOutputChannel(d.channel.name);
                return channelDef.repeated || channelDef.optional ? '-' : '';
              }
            });
        }

        const transformerNameEnter = transformerEnter.append('text')
          .classed('transformer-name', true)
          .attr('text-anchor', 'middle')
          .attr('dy', "0.3em");
        const transformerNameUpdate = transformerUpdate.select('.transformer-name')
          .attr('transform', (d) => `translate(${transformerWidth/2}, ${transformerHeight(d.transformer)/2})`)
          .text((d) => d.transformer.name);

        const dropTargetsEnter = rowEnter.append('g')
          .classed('drop-targets', true);
        const dropTargetsUpdate = rowUpdate.select('.drop-targets')
          .attr('display', () => component.dragService.isDraggingClass(Transformer) ? null : 'none');

        const dropTarget = dropTargetsUpdate.selectAll('.drop-target').data(d => getDropTargetLocations(d.row, d.channelWidth).map(x => { return { row: d.row, x: x, channelWidth: d.channelWidth } }));
        dropTarget.exit().remove();
        const dropTargetEnter = dropTarget.enter().append('path')
          .classed('drop-target', true)
          .on('mouseup', (d, i) => {
            const dragging = component.dragService.dragging.getValue();
            if (dragging) {
              if (dragging.object instanceof Transformer) {
                d.row.transformers.next(d.row.transformers.getValue().insert(i, dragging.object));
                this.dragService.stopDrag();
                d3.event.stopPropagation();
              }
            }
          });
        const dropTargetUpdate = dropTarget.merge(dropTargetEnter)
          .attr('d', roundedRectangle(dropTargetWidth, channelSpacing * 2, 8))
          .attr('transform', d => `translate(${d.x + d.channelWidth/2 -dropTargetWidth/2},0)`);

        (rows.node() as SVGGElement).appendChild((rows.node() as SVGGElement).removeChild(rowPlaceholder.node() as SVGGElement));

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

        rowPlaceholder
          .attr('transform', () => {
            const rowNodes = rowUpdate.nodes() as SVGGraphicsElement[];
            const lastRowNode = rowNodes[rowNodes.length - 1];
            if (lastRowNode) {
              const sizeAndPos = getSizeAndPos(lastRowNode);
              return `translate(0, ${sizeAndPos.y + sizeAndPos.height + rowSpacing})`;
            } else {
              return 'translate(0,0)';
            }
          })
          .attr('display', () => component.dragService.isDraggingClass(Transformer) || !component.dataService.hierarchy.getValue().rows.getValue().size ? null : 'none');

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

    function transformerHeight(transformer: Transformer) {
      const inputs = getTransformerInputChannelConnections(transformer);
      const outputs = getTransformerOutputChannelConnections(transformer);
      return (Math.max(inputs.length, outputs.length) + 1) * channelSpacing;
    }

    function transformerLocation(transformerIndex: number, transformerCount: number, channelWidth: number) {
      return transformerIndex * (channelWidth + transformerWidth) + channelWidth;
    }

    function channelX(channelIndex: number, channelWidth: number) {
      return (channelWidth + transformerWidth) * channelIndex
    }

    function channelY(channelIndex: number) {
      return channelIndex * channelSpacing;
    }

    function channelWidth(channelCount: number) {
      return (width - (transformerWidth * (channelCount - 1))) / channelCount;
    }

    function drawChannelConnection(context: Path, start: { x: number, y:number }, end: { x:number, y:number }): Path {
      const delta = {
        x: end.x - start.x,
        y: end.y - start.y
      };
      context.moveTo(start.x, start.y);
      context.bezierCurveTo(start.x + delta.x/2, start.y, start.x + delta.x/2, end.y, end.x, end.y);
      return context;
    }

    function createChannelConnections(row: Row): {startY:number, endY: number}[][] {
      return row.transformers.getValue().toArray().reduce((channelGroups, transformer, transformerIndex, transformers) => {
        if (transformerIndex === 0) {
          channelGroups.push(getTransformerInputChannelConnections(transformer).reduce((channels, channelOrDef, chanIndex) => {
            if (channelOrDef instanceof TransformerChannel) {
              channels.push({
                startY: channelY(chanIndex),
                endY: channelY(chanIndex)
              })
            }
            return channels;
          }, [] as any[]))
        } else {
          channelGroups.push(getTransformerInputChannelConnections(transformer).map((chanOrDef, chanIndex) => { return {index: chanIndex, channel: chanOrDef} }).filter((chanAndIndex) => chanAndIndex.channel instanceof TransformerChannel).reduce((channels, currentChanAndIndex, currentChanIndex) => {
            const linkingChanAndIdx = getTransformerOutputChannelConnections(transformers[transformerIndex - 1]).map((chanOrDef, chanIndex) => { return {index: chanIndex, channel: chanOrDef} }).filter((chanAndIndex) => chanAndIndex.channel instanceof TransformerChannel)[currentChanIndex];
            if (linkingChanAndIdx) {
              channels.push({
                startY: channelY(linkingChanAndIdx.index),
                endY: channelY(currentChanAndIndex.index)
              })
            }
            return channels;
          }, [] as any[]))
        }
        if (transformerIndex === transformers.length - 1) {
          channelGroups.push(getTransformerOutputChannelConnections(transformer).reduce((channels, channelOrDef, chanIndex) => {
            if (channelOrDef instanceof TransformerChannel) {
              channels.push({
                startY: channelY(chanIndex),
                endY: channelY(chanIndex)
              })
            }
            return channels;
          }, [] as any[]))
        }
        return channelGroups;
      }, [] as any[]);
    }

    function getTransformerInputChannelConnections(transformer: Transformer): Array<TransformerChannelDef | TransformerChannel> {
      return component.metadataService.metadata.getValue().getAnalytic(transformer.name).inputChannels
        .flatMap((channelDef: TransformerChannelDef) => {
           const connectedChannels = transformer.getInputChannels(channelDef.name);
           if (connectedChannels.isEmpty()) {
              return List.of(channelDef);
           } else if (channelDef.repeated) {
             return connectedChannels.push(channelDef);
           } else {
             return connectedChannels;
           }
        }).toArray() as Array<TransformerChannelDef | TransformerChannel>;
    }

    function getTransformerOutputChannelConnections(transformer: Transformer): Array<TransformerChannelDef | TransformerChannel> {
      return component.metadataService.metadata.getValue().getAnalytic(transformer.name).outputChannels
        .flatMap((channelDef: TransformerChannelDef) => {
          const connectedChannels = transformer.getOutputChannels(channelDef.name);
          if (connectedChannels.isEmpty()) {
            return List.of(channelDef);
          } else if (channelDef.repeated) {
            return connectedChannels.push(channelDef);
          } else {
            return connectedChannels;
          }
        }).toArray() as Array<TransformerChannelDef | TransformerChannel>;
    }

    function getDropTargetLocations(row: Row, channelWidth: number) : number[] {
      const transformerCount = row.transformers.getValue().size;
      if (transformerCount >= maxTransformerCount) {
        return [];
      }
      return new Array(transformerCount + 1).fill(undefined).map((ignore, i) => (transformerWidth + channelWidth) * i)
    }
  }

  @HostListener('mouseup', ['$event.target'])
  parentMouseUp() {
    if (!this.dragService.dragging.getValue()) {
      this.selectionService.selection.next(undefined);
    }
  }
}

function findParentNodeWithClass(el: Element, className: string): Element | null {
  let parent = el.parentNode;
  while (parent) {
    if (d3.select(parent as Element).classed(className)) {
      return parent as Element;
    }
    parent = parent.parentNode;
  }
  return parent;
}

export function roundedRectangle(width: number, height: number, cornerRadius: number) {
  return `M${cornerRadius} 0 L${width} 0 L${width} ${height-cornerRadius} Q${width} ${height} ${width-cornerRadius} ${height} L0 ${height} L0 ${cornerRadius} Q0 0 ${cornerRadius} 0z`;
}
