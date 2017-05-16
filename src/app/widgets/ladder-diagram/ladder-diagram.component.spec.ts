import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import * as d3 from "d3";
import {Injectable} from "@angular/core";
import {AbstractDataService} from "../../services/AbstractDataService";
import {RowChannelBuilder} from "../../classes/Channel";
import {Config, ConfigBuilder} from "app/classes/Config";
import {LadderDiagramComponent} from "./ladder-diagram.component";
import {AbstractDragService, Dragged} from "../../services/AbstractDragService";
import {NestedRowBuilder, RowBuilder} from "app/classes/Row";
import {DragService} from "app/services/DragService";
import {TestUtils} from "../../services/TestUtil.spec";
import {AbstractMetadataService, MetadataService} from "../../services/MetadataService";
import {Metadata, MetadataBuilder} from "../../classes/Metadata";
import {TransformerChannel} from "../../classes/TransformerChannel";

@Injectable()
class DataServiceMock extends AbstractDataService {}

describe('LadderDiagramComponent', () => {
  let component: LadderDiagramComponent;
  let fixture: ComponentFixture<LadderDiagramComponent>;
  let el: HTMLElement;
  let dataService: DataServiceMock;
  let dragService: DragService;
  let metadataService: MetadataService;

  const testMetadata = new MetadataBuilder()
    .withAnalytic()
      .Name('Analytic1')
      .withInputChannel().Name("Analytic1:In1").endWith()
      .withOutputChannel().Name("Analytic1:Out1").endWith()
      .endWith()
    .withAnalytic()
      .Name('Analytic2')
      .withInputChannel().Name("Analytic2:In1").endWith()
      .withOutputChannel().Name("Analytic2:Out1").endWith()
      .endWith()
    .withAnalytic()
      .Name('Analytic3')
      .withInputChannel().Name("Analytic3:In1").endWith()
      .withInputChannel().Name("Analytic3:In2").endWith()
      .withOutputChannel().Name("Analytic3:Out1").endWith()
      .endWith()
    .withAnalytic()
      .Name('Analytic4')
      .withInputChannel().Name("Analytic3:In1").endWith()
      .withOutputChannel().Name("Analytic3:Out1").endWith()
      .withOutputChannel().Name("Analytic3:Out2").endWith()
      .endWith()
    .withAnalytic()
      .Name('Analytic5')
      .withInputChannel().Name("Analytic5:In1").endWith()
      .withInputChannel().Name("Analytic5:In2").endWith()
      .withOutputChannel().Name("Analytic5:Out1").endWith()
      .withOutputChannel().Name("Analytic5:Out2").endWith()
      .endWith()
    .build();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LadderDiagramComponent ],
      providers: [
        {provide: AbstractDataService, useClass: DataServiceMock},
        {provide: AbstractDragService, useClass: DragService},
        {provide: AbstractMetadataService, useClass: MetadataService},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    dataService = TestBed.get(AbstractDataService) as DataServiceMock;
    dragService = TestBed.get(AbstractDragService) as DragService;
    metadataService = TestBed.get(AbstractMetadataService) as MetadataService;
    fixture = TestBed.createComponent(LadderDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
  });

  beforeEach(function() {
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('should have an svg child element', () => {
    expect(el.children[0].nodeName).toEqual('svg');
  });

  it('should create correct number of rows', () => {
    for(let i = 0; i < 5; i++) {
      let configBuilder = new ConfigBuilder();
      for(let  j = 0; j<i; j++) {
        configBuilder =  configBuilder.withRow().endWith();
      }
      const config: Config = configBuilder.build();

      dataService.hierarchy.next(config);
      fixture.detectChanges();

      expect(el.querySelectorAll('.rows > .row').length).toEqual(i);
    }
  });

  it('should create correct number of transformers', () => {
    for(let i = 0; i < 5; i++) {
      let rowBuilder = new ConfigBuilder().withRow()
        .MaxTransformerCount(4);
      for (let j = 0; j < i; j++) {
        rowBuilder = rowBuilder.withTransformer().Name('Analytic1').endWith();
      }
      const config: Config = rowBuilder.endWith().build();

      metadataService.metadata.next(testMetadata);
      dataService.hierarchy.next(config);
      fixture.detectChanges();

      const transformers = Array.from(el.querySelectorAll('.rows')[0].querySelectorAll('.transformers > .transformer'));
      expect(transformers).toBeArrayOfSize(i);
      transformers.forEach(transformer => {
        expect(transformer.querySelectorAll('.transformer-name')[0].textContent).toEqual('Analytic1');
      })
    }
  });

  describe('should create correct number of inputChannels', () => {
    for(let i = 0; i < 5; i++) {
      it(`InputChannels: ${i}`, () => {
        let transformerDefBuilder = new MetadataBuilder()
          .withAnalytic().Name('Analytic1');

        for (let j = 0; j < i; j++) {
          transformerDefBuilder = transformerDefBuilder.withInputChannel().Name(`InChannel${j}`).endWith();
        }
        const metadata: Metadata = transformerDefBuilder.endWith().build();

        metadataService.metadata.next(metadata);

        dataService.hierarchy.next(new ConfigBuilder()
          .withRow()
            .MaxTransformerCount(4)
            .pushTransformer(metadata.createAnalytic('Analytic1'))
            .endWith()
          .build()
        );
        fixture.detectChanges();

        const inChannels = Array.from(el.querySelectorAll('.row-input-channel'));
        expect(inChannels).toBeArrayOfSize(i);
        inChannels.forEach((inChannel, z) => {
          expect(inChannel.querySelectorAll('text')[0].textContent).toEqual(`InChannel${z}`);
        });
      });
    }
  });

  describe('should create correct number of outputChannels', () => {
    for(let i = 0; i < 5; i++) {
      it(`OutputChannels: ${i}`, () => {
        let transformerDefBuilder = new MetadataBuilder()
          .withAnalytic().Name('Analytic1');

        for (let j = 0; j < i; j++) {
          transformerDefBuilder = transformerDefBuilder.withOutputChannel().Name(`OutChannel${j}`).endWith();
        }
        const metadata: Metadata = transformerDefBuilder.endWith().build();

        metadataService.metadata.next(metadata);

        dataService.hierarchy.next(new ConfigBuilder()
          .withRow()
            .MaxTransformerCount(4)
            .pushTransformer(metadata.createAnalytic("Analytic1"))
            .endWith()
          .build()
        );
        fixture.detectChanges();

        const outChannels = Array.from(el.querySelectorAll('.row-output-channel'));
        expect(outChannels).toBeArrayOfSize(i);
        outChannels.forEach((outChannel, z) => {
          expect(outChannel.querySelectorAll('text')[0].textContent).toEqual(`OutChannel${z}`);
        });
      });
    }
  });

  describe('should correctly create placeholder and user-defined channel endpoints', () => {
    for(let i = 0; i < 5; i++) {
      it(`OutputChannels: ${i}`, () => {
        const metadata = new MetadataBuilder()
          .withAnalytic()
            .Name('Analytic1')
            .withInputChannel().Name('InChannel0').endWith()
            .withInputChannel().Name('InChannel1').endWith()
            .withInputChannel().Name('InChannel2').endWith()
            .withInputChannel().Name('InChannel3').endWith()
            .withInputChannel().Name('InChannel4').endWith()
            .withOutputChannel().Name('OutChannel0').endWith()
            .withOutputChannel().Name('OutChannel1').endWith()
            .withOutputChannel().Name('OutChannel2').endWith()
            .withOutputChannel().Name('OutChannel3').endWith()
            .withOutputChannel().Name('OutChannel4').endWith()
            .endWith()
          .build();

        const config: Config = new ConfigBuilder()
          .withRow()
            .MaxTransformerCount(4)
            .pushTransformer(metadata.createAnalytic("Analytic1"))
            .withInputChannel(i).Name('UserIn').endWith()
            .withOutputChannel(i).Name('UserOut').endWith()
            .endWith()
          .build();

        metadataService.metadata.next(metadata);
        dataService.hierarchy.next(config);
        fixture.detectChanges();

        const inChannels = Array.from(el.querySelectorAll('.row-input-channel'));
        expect(inChannels).toBeArrayOfSize(5);
        inChannels.forEach((inChannel, z) => {
          expect(d3.select(inChannel).classed('placeholder-channel')).toEqual(z != i);
          expect(inChannel.querySelectorAll('text')[0].textContent).toEqual(z == i ? 'UserIn' : `InChannel${z}`);
        });

        const outChannels = Array.from(el.querySelectorAll('.row-output-channel'));
        expect(outChannels).toBeArrayOfSize(5);
        outChannels.forEach((outChannel, z) => {
          expect(d3.select(outChannel).classed('placeholder-channel')).toEqual(z != i);
          expect(outChannel.querySelectorAll('text')[0].textContent).toEqual(z == i ? 'UserOut' : `OutChannel${z}`);
        });
      });
    }
  });

  it('should correctly handle a complex config', () => {
    const metadata = new MetadataBuilder()
      .withAnalytic()
        .Name('Analytic1')
        .withInputChannel().Name("Analytic1:In1").endWith()
        .withOutputChannel().Name("Analytic1:Out1").endWith()
        .endWith()
      .withAnalytic()
        .Name('Analytic2')
        .withInputChannel().Name("Analytic2:In1").endWith()
        .withOutputChannel().Name("Analytic2:Out1").endWith()
        .endWith()
      .withAnalytic()
        .Name('Analytic3')
        .withInputChannel().Name("Analytic3:In1").endWith()
        .withInputChannel().Name("Analytic3:In2").endWith()
        .withInputChannel().Name("Analytic3:In3").endWith()
        .withOutputChannel().Name("Analytic3:Out1").endWith()
        .endWith()
      .build();

    const config = new ConfigBuilder()
      .withRow()
        .MaxTransformerCount(3)
        .withInputChannel(0).Name("hello").endWith()
        .withOutputChannel(0).Name("goodbye").endWith()
        .pushTransformer(metadata.createAnalytic("Analytic1"))
        .pushTransformer(metadata.createAnalytic("Analytic2"))
      .endWith()
      .withRow()
        .MaxTransformerCount(3)
        .withInputChannel(2).Name("hello").endWith()
        .pushTransformer(metadata.createAnalytic("Analytic3"))
      .endWith()
      .build();

    metadataService.metadata.next(metadata);
    dataService.hierarchy.next(config);
    fixture.detectChanges();

    const rows = Array.from(el.querySelectorAll('.rows > .row'));
    expect(rows).toBeArrayOfSize(2);

    const row0 = rows[0];
    const row0transformers = Array.from(row0.querySelectorAll('.transformers > .transformer'));
    expect(row0transformers).toBeArrayOfSize(2);

    expect(row0transformers[0].querySelectorAll('.transformer-name')[0].textContent).toEqual('Analytic1');
    expect(row0transformers[1].querySelectorAll('.transformer-name')[0].textContent).toEqual('Analytic2');

    expect(Array.from(row0.querySelectorAll('.row-input-channel'))).toBeArrayOfSize(1);
    expect(Array.from(row0.querySelectorAll('.row-output-channel'))).toBeArrayOfSize(1);
    expect(Array.from(row0.querySelectorAll('.placeholder-channel'))).toBeArrayOfSize(0);

    const row1 = rows[1];
    const row1transformers = Array.from(row1.querySelectorAll('.transformers > .transformer'));
    expect(row1transformers).toBeArrayOfSize(1);

    expect(row1transformers[0].querySelectorAll('.transformer-name')[0].textContent).toEqual('Analytic3');

    expect(Array.from(row1.querySelectorAll('.row-input-channel'))).toBeArrayOfSize(3);
    expect(Array.from(row1.querySelectorAll('.row-output-channel'))).toBeArrayOfSize(1);
    expect(Array.from(row1.querySelectorAll('.row-input-channel.placeholder-channel'))).toBeArrayOfSize(2);
    expect(Array.from(row1.querySelectorAll('.row-output-channel.placeholder-channel'))).toBeArrayOfSize(1);
  });


  it('ISSUE-127804: On a config reload the input and output channels and transformers should be redrawn correctly', () => {
    const config = new ConfigBuilder()
      .Name("Single row with a single Analytic containing two input channels and two output channels")
      .Description("This configuration demonstrates a single row with a single Analytic containing two input channels and two output channels")
      .withRow()
        .MaxTransformerCount(3)
        .withTransformer()
          .Name("Analytic1")
        .endWith()
      .endWith()
      .build();

    metadataService.metadata.next(testMetadata);
    dataService.hierarchy.next(config);
    fixture.detectChanges();

    const config2 = new ConfigBuilder()
      .Name("Single row with a single Analytic containing two input channels and two output channels")
      .Description("This configuration demonstrates a single row with a single Analytic containing two input channels and two output channels")
      .withRow()
        .MaxTransformerCount(3)
        .withInputChannel(0).Name("OverriddenInput").endWith()
        .withOutputChannel(0).Name("OverriddenOutput").endWith()
        .pushTransformer(testMetadata.createAnalytic("Analytic5"))
      .endWith()
      .build();

    dataService.hierarchy.next(config2);
    fixture.detectChanges();

    const inChannels = Array.from(el.querySelectorAll('.row-input-channel'));
    expect(inChannels).toBeArrayOfSize(2);
    expect(d3.select(inChannels[0]).classed('placeholder-channel')).toBeFalse();
    expect(d3.select(inChannels[1]).classed('placeholder-channel')).toBeTrue();
    expect(inChannels[0].querySelectorAll('text')[0].textContent).toEqual(`OverriddenInput`);
    expect(inChannels[1].querySelectorAll('text')[0].textContent).toEqual(`Analytic5:In2`);

    const outChannels = Array.from(el.querySelectorAll('.row-output-channel'));
    expect(outChannels).toBeArrayOfSize(2);
    expect(d3.select(outChannels[0]).classed('placeholder-channel')).toBeFalse();
    expect(d3.select(outChannels[1]).classed('placeholder-channel')).toBeTrue();
    expect(outChannels[0].querySelectorAll('text')[0].textContent).toEqual(`OverriddenOutput`);
    expect(outChannels[1].querySelectorAll('text')[0].textContent).toEqual(`Analytic5:Out2`);

    const transformerName = Array.from(el.querySelectorAll('.transformer-name'));
    expect(transformerName).toBeArrayOfSize(1);
    expect(transformerName[0].textContent).toEqual("Analytic5");

  });

  // TODO: update logic
  xdescribe('should draw appropriate drop targets when dragging a Transformer', () => {
    [
      { description: "RowSize: 1, Transformers: 0", setup: (row: RowBuilder): RowBuilder => row.MaxTransformerCount(1), dropTargetCount: 1 }, {
        description: "RowSize: 1, Transformers: 1",
        setup: (row: RowBuilder): RowBuilder => {
          return row.MaxTransformerCount(1)
            .pushTransformer(testMetadata.createAnalytic("Analytic1"))
        },
        dropTargetCount: 0,
      },{
        description: "RowSize: 2, Transformers: 1",
        setup: (row: RowBuilder): RowBuilder => {
          return row.MaxTransformerCount(2)
            .pushTransformer(testMetadata.createAnalytic("Analytic1"))
        },
        dropTargetCount: 2
      },{
        description: "RowSize: 2, Transformers: 1 (Multiple Inputs)",
        setup: (row: RowBuilder): RowBuilder => {
          return row.MaxTransformerCount(2)
            .pushTransformer(testMetadata.createAnalytic("Analytic3"))
        },
        dropTargetCount: 0
      },{
        description: "RowSize: 2, Transformers: 1 (Multiple Outputs)",
        setup: (row: RowBuilder): RowBuilder => {
          return row.MaxTransformerCount(2)
            .pushTransformer(testMetadata.createAnalytic("Analytic4"))
        },
        dropTargetCount: 0
      }
    ].forEach((testCase) => {
      it(testCase.description + ', DropTargets: ' + testCase.dropTargetCount, () => {
        const config = (testCase.setup(new ConfigBuilder().withRow()) as NestedRowBuilder<ConfigBuilder>).endWith().build();

        metadataService.metadata.next(testMetadata);
        dataService.hierarchy.next(config);
        fixture.detectChanges();

        // Create a temporary dom element and transformer to simulate that one has been dragged
        const dragEl = TestUtils.withTempSvg().append('rect').attr('width', 100).attr('height', 100).node() as SVGRectElement;
        dragService.startDrag({ sourceElement: dragEl, object: testMetadata.createAnalytic("Analytic1") });

        fixture.detectChanges();

        const dropTargets = Array.from(el.querySelectorAll('.drop-target'));
        expect(dropTargets).toBeArrayOfSize(testCase.dropTargetCount);
      })
    })
  });

  describe('should insert a transformer at the appropriate position when dropping on a drop target', () => {
    for(let i = 0; i < 3; i++) {
      it('Drop Target: ' + i, () => {
        const config = new ConfigBuilder()
          .withRow()
            .MaxTransformerCount(3)
            .pushTransformer(testMetadata.createAnalytic("Analytic1"))
            .pushTransformer(testMetadata.createAnalytic("Analytic1"))
          .endWith()
          .build();

        metadataService.metadata.next(testMetadata);
        dataService.hierarchy.next(config);
        fixture.detectChanges();

        // Create a temporary dom element and transformer to simulate that one has been dragged
        const dragEl = TestUtils.withTempSvg().append('rect').attr('width', 100).attr('height', 100).node() as SVGRectElement;
        const dragTransformer = testMetadata.createAnalytic("Analytic1");
        dragService.startDrag({ sourceElement: dragEl, object: dragTransformer });

        fixture.detectChanges();

        const dropTargets = Array.from(el.querySelectorAll('.drop-target'));
        expect(dropTargets).toBeArrayOfSize(3);
        expect(dragService.dragging.getValue()).toBeDefined();

        dropTargets[i].dispatchEvent(new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 200,
          clientY: 200
        }));

        expect(dragService.dragging.getValue()).toBeUndefined();

        const transformers = Array.from(el.querySelectorAll('.transformer'));
        expect(transformers).toBeArrayOfSize(3);

        expect((d3.select(transformers[i]).datum() as any).transformer).toBe(dragTransformer);
      })
    }
  });

  // Drag the first transformer and drop in the last position
  it('should allow dragging/dropping of existing transformer', () => {
    const config = new ConfigBuilder()
      .withRow()
        .MaxTransformerCount(3)
        .pushTransformer(testMetadata.createAnalytic("Analytic1"))
        .pushTransformer(testMetadata.createAnalytic("Analytic1"))
        .pushTransformer(testMetadata.createAnalytic("Analytic1"))
      .endWith()
      .build();

    metadataService.metadata.next(testMetadata);
    dataService.hierarchy.next(config);
    fixture.detectChanges();

    const transformerEls = Array.from(el.querySelectorAll('.transformer'));
    const transformers = transformerEls.map((transEl) => (d3.select(transEl).datum() as any).transformer);

    const transEl = transformerEls[0];

    transEl.dispatchEvent(new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 200,
      clientY: 200
    }));
    fixture.detectChanges();

    // Expect the drag not to have started
    expect((dragService.dragging.getValue() as Dragged)).toBeUndefined();
    expect(Array.from(el.querySelectorAll('.transformer'))).toBeArrayOfSize(3);
    expect(d3.select(el).select('.drop-targets').attr('display')).toEqual('none');

    jasmine.clock().tick(500); // hold the mousedown for half a second to initiate the drag

    expect((dragService.dragging.getValue() as Dragged).object).toBe(transformers[0]);
    expect(Array.from(el.querySelectorAll('.transformer'))).toBeArrayOfSize(3); // Still present until mouse leaves
    expect(Array.from(el.querySelectorAll('.drop-target'))).toBeArrayOfSize(4);
    expect(d3.select(el).select('.drop-targets').attr('display')).toEqual(null);

    transEl.dispatchEvent(new MouseEvent("mouseleave", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 0,
      clientY: 0
    }));
    fixture.detectChanges();

    expect((dragService.dragging.getValue() as Dragged).object).toBe(transformers[0]);
    expect(Array.from(el.querySelectorAll('.transformer'))).toBeArrayOfSize(2);
    expect(d3.select(el).select('.drop-targets').attr('display')).toEqual(null);
    const dropTargets = Array.from(el.querySelectorAll('.drop-target'));
    expect(dropTargets).toBeArrayOfSize(3);

    dropTargets[2].dispatchEvent(new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 200,
      clientY: 200
    }));
    fixture.detectChanges();

    expect(dragService.dragging.getValue()).toBeUndefined();
    expect(d3.select(el).select('.drop-targets').attr('display')).toEqual('none');
    const newTransformerEls = Array.from(el.querySelectorAll('.transformer'));
    expect(newTransformerEls).toBeArrayOfSize(3);
    const newTransformers = newTransformerEls.map((transEl) => (d3.select(transEl).datum() as any).transformer);
    expect(newTransformers).toEqual([transformers[1], transformers[2], transformers[0]]);
  });

  it('should not allow dragging of placeholder channels', () => {
    const config = new ConfigBuilder()
      .withRow()
        .MaxTransformerCount(1)
        .pushTransformer(testMetadata.createAnalytic("Analytic1"))
      .endWith()
      .build();

    metadataService.metadata.next(testMetadata);
    dataService.hierarchy.next(config);
    fixture.detectChanges();

    const inChannel = Array.from(el.querySelectorAll('.row-input-channel'))[0];
    const outChannel = Array.from(el.querySelectorAll('.row-output-channel'))[0];

    [inChannel, outChannel].forEach((channelEl) => {
      channelEl.dispatchEvent(new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: 200,
        clientY: 200
      }));
      fixture.detectChanges();

      expect(dragService.dragging.getValue()).toBeUndefined();
    })
  });

  xdescribe('should allow dragging/dropping of existing channels', () => {
    [
      {
        description: 'inputChannel dropped on output placeholder',
        inputChannel: new RowChannelBuilder().build(),
        outputChannel: undefined,
        fromSelector: '.inChannel .channel',
        toSelector: '.outChannel .channel'
      },{
        description: 'outputChannel dropped on input placeholder',
        inputChannel: undefined,
        outputChannel: new RowChannelBuilder().build(),
        fromSelector: '.outChannel .channel',
        toSelector: '.inChannel .channel'
      },{
        description: 'inputChannel dropped on outputChannel',
        inputChannel: new RowChannelBuilder().build(),
        outputChannel: new RowChannelBuilder().build(),
        fromSelector: '.inChannel .channel',
        toSelector: '.outChannel .channel'
      },{
        description: 'outputChannel dropped on inputChannel',
        inputChannel: new RowChannelBuilder().build(),
        outputChannel: new RowChannelBuilder().build(),
        fromSelector: '.outChannel .channel',
        toSelector: '.inChannel .channel'
      },{
        description: 'inputChannel dropped on inputChannel',
        inputChannel: new RowChannelBuilder().build(),
        outputChannel: undefined,
        fromSelector: '.inChannel .channel',
        toSelector: '.inChannel .channel'
      },{
        description: 'outputChannel dropped on outputChannel',
        inputChannel: undefined,
        outputChannel: new RowChannelBuilder().build(),
        fromSelector: '.outChannel .channel',
        toSelector: '.outChannel .channel'
      },
    ].forEach((testCase) => {
      it(testCase.description, () => {
        const rowBuilder = new RowBuilder()
          .MaxTransformerCount(1)
          .pushTransformer(testMetadata.createAnalytic("Analytic1"));

        if (testCase.inputChannel) {
          rowBuilder.pushInputChannel({0: testCase.inputChannel})
        }
        if (testCase.outputChannel) {
          rowBuilder.pushOutputChannel({0: testCase.outputChannel})
        }

        const config = new ConfigBuilder()
          .pushRow(rowBuilder.build())
          .build();

        metadataService.metadata.next(testMetadata);
        dataService.hierarchy.next(config);
        fixture.detectChanges();

        const fromChanEl = el.querySelectorAll(testCase.fromSelector)[0];
        const toChanEl = el.querySelectorAll(testCase.toSelector)[0];
        const dragChan = (d3.select(fromChanEl).datum() as any).channel;

        fromChanEl.dispatchEvent(new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 200,
          clientY: 200
        }));
        fixture.detectChanges();

        expect((dragService.dragging.getValue() as Dragged).object).toBe(dragChan);
        expect((d3.select(el.querySelectorAll(testCase.fromSelector)[0]).datum() as any).channel).toBe(dragChan); // Not removed until mouse leave

        fromChanEl.dispatchEvent(new MouseEvent("mouseleave", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 200,
          clientY: 200
        }));
        fixture.detectChanges();

        expect((dragService.dragging.getValue() as Dragged).object).toBe(dragChan);
        expect((d3.select(el.querySelectorAll(testCase.fromSelector)[0]).datum() as any).channel).toEqual(jasmine.any(TransformerChannel)); // Replaced with placeholder

        toChanEl.dispatchEvent(new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 200,
          clientY: 200
        }));
        fixture.detectChanges();

        expect(dragService.dragging.getValue()).toBeUndefined();
        expect((d3.select(el.querySelectorAll(testCase.toSelector)[0]).datum() as any).channel).toBe(dragChan);
      })
    })
  });

});
