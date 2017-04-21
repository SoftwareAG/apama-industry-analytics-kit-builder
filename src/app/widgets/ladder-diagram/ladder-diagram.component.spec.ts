import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import * as d3 from "d3";
import {Injectable} from "@angular/core";
import {AbstractDataService} from "../../services/AbstractDataService";
import {ChannelBuilder} from "../../classes/Channel";
import {Config, ConfigBuilder} from "app/classes/Config";
import {LadderDiagramComponent} from "./ladder-diagram.component";
import {TransformerBuilder} from "../../classes/Transformer";
import {AbstractDragService, Dragged} from "../../services/AbstractDragService";
import {NestedRowBuilder, RowBuilder} from "app/classes/Row";
import {DragService} from "app/services/DragService";
import {TransformerChannelDef} from "../../classes/TransformerChannelDef";
import {TestUtils} from "../../services/TestUtil.spec";

@Injectable()
class DataServiceMock extends AbstractDataService {}

describe('LadderDiagramComponent', () => {
  let component: LadderDiagramComponent;
  let fixture: ComponentFixture<LadderDiagramComponent>;
  let el: HTMLElement;
  let dataService: DataServiceMock;
  let dragService: DragService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LadderDiagramComponent ],
      providers: [
        {provide: AbstractDataService, useClass: DataServiceMock},
        {provide: AbstractDragService, useClass: DragService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    dataService = TestBed.get(AbstractDataService) as DataServiceMock;
    dragService = TestBed.get(AbstractDragService) as DragService;
    fixture = TestBed.createComponent(LadderDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
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
        rowBuilder = rowBuilder.withTransformer().Name(`Transformer${j}`).endWith();
      }
      const config: Config = rowBuilder.endWith().build();

      dataService.hierarchy.next(config);
      fixture.detectChanges();

      const transformers = Array.from(el.querySelectorAll('.rows')[0].querySelectorAll('.transformers > .transformer'));
      expect(transformers).toBeArrayOfSize(i);
      transformers.forEach((transformer, z) => {
        expect(transformer.querySelectorAll('text')[0].textContent).toEqual(`Transformer${z}`);
      });
    }
  });

  describe('should create correct number of inputChannels', () => {
    for(let i = 0; i < 5; i++) {
      it(`InputChannels: ${i}`, () => {
        let transformerBuilder = new ConfigBuilder().withRow()
          .MaxTransformerCount(4)
          .withTransformer();
        for (let j = 0; j < i; j++) {
          transformerBuilder = transformerBuilder.withInputChannel().Name(`InChannel${j}`).endWith();
        }
        const config: Config = transformerBuilder.endWith().endWith().build();

        dataService.hierarchy.next(config);
        fixture.detectChanges();

        const inChannels = Array.from(el.querySelectorAll('.channels > .inChannel'));
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
        let transformerBuilder = new ConfigBuilder().withRow()
          .MaxTransformerCount(4)
          .withTransformer();
        for (let j = 0; j < i; j++) {
          transformerBuilder = transformerBuilder.withOutputChannel().Name(`OutChannel${j}`).endWith();
        }
        const config: Config = transformerBuilder.endWith().endWith().build();

        dataService.hierarchy.next(config);
        fixture.detectChanges();

        const outChannels = Array.from(el.querySelectorAll('.channels > .outChannel'));
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
        let rowBuilder = new ConfigBuilder().withRow()
          .MaxTransformerCount(4)
          .withTransformer()
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
            .endWith();
        for (let j = 0; j < 5; j++) {
          if (j == i) {
            rowBuilder = rowBuilder.withInputChannel().Name('UserIn').endWith();
            rowBuilder = rowBuilder.withOutputChannel().Name('UserOut').endWith();
          } else {
            rowBuilder = rowBuilder.pushInputChannel(undefined);
            rowBuilder = rowBuilder.pushOutputChannel(undefined);
          }
        }
        const config: Config = rowBuilder.endWith().build();

        dataService.hierarchy.next(config);
        fixture.detectChanges();

        const inChannels = Array.from(el.querySelectorAll('.channels > .inChannel'));
        expect(inChannels).toBeArrayOfSize(5);
        inChannels.forEach((inChannel, z) => {
          expect(d3.select(inChannel.querySelectorAll('.channel')[0]).classed('placeholder-channel')).toEqual(z != i);
          expect(inChannel.querySelectorAll('text')[0].textContent).toEqual(z == i ? 'UserIn' : `InChannel${z}`);
        });

        const outChannels = Array.from(el.querySelectorAll('.channels > .outChannel'));
        expect(outChannels).toBeArrayOfSize(5);
        outChannels.forEach((outChannel, z) => {
          expect(d3.select(outChannel.querySelectorAll('.channel')[0]).classed('placeholder-channel')).toEqual(z != i);
          expect(outChannel.querySelectorAll('text')[0].textContent).toEqual(z == i ? 'UserOut' : `OutChannel${z}`);
        });
      });
    }
  });

  it('should correctly handle a complex config', () => {
    const config = new ConfigBuilder()
      .withRow()
        .MaxTransformerCount(3)
        .withInputChannel().Name("hello").endWith()
        .withOutputChannel().Name("goodbye").endWith()
        .withTransformer()
          .Name("MyFirstAnalytic")
          .withInputChannel().Name("MyFirstAnalytic:In1").endWith()
          .withOutputChannel().Name("MyFirstAnalytic:Out1").endWith()
        .endWith()
        .withTransformer()
          .Name("MySecondAnalytic")
          .withInputChannel().Name("MySecondAnalytic:In1").endWith()
          .withOutputChannel().Name("MySecondAnalytic:Out1").endWith()
        .endWith()
      .endWith()
      .withRow()
        .MaxTransformerCount(3)
        .pushInputChannel(undefined)
        .pushInputChannel(undefined)
        .withInputChannel().Name("hello").endWith()
        .withTransformer()
          .Name("MyThirdAnalytic")
          .withInputChannel().Name("MyThirdAnalytic:In1").endWith()
          .withInputChannel().Name("MyThirdAnalytic:In2").endWith()
          .withInputChannel().Name("MyThirdAnalytic:In3").endWith()
          .withOutputChannel().Name("MyThirdAnalytic:Out1").endWith()
        .endWith()
      .endWith()
      .build();

    dataService.hierarchy.next(config);
    fixture.detectChanges();

    const rows = Array.from(el.querySelectorAll('.rows > .row'));
    expect(rows).toBeArrayOfSize(2);

    const row0 = rows[0];
    const row0transformers = Array.from(row0.querySelectorAll('.transformers > .transformer'));
    expect(row0transformers).toBeArrayOfSize(2);

    expect(row0transformers[0].querySelectorAll('text')[0].textContent).toEqual('MyFirstAnalytic');
    expect(row0transformers[1].querySelectorAll('text')[0].textContent).toEqual('MySecondAnalytic');

    expect(Array.from(row0.querySelectorAll('.channels > .inChannel'))).toBeArrayOfSize(1);
    expect(Array.from(row0.querySelectorAll('.channels > .outChannel'))).toBeArrayOfSize(1);
    expect(Array.from(row0.querySelectorAll('.channels > .placeholder-channel'))).toBeArrayOfSize(0);

    const row1 = rows[1];
    const row1transformers = Array.from(row1.querySelectorAll('.transformers > .transformer'));
    expect(row1transformers).toBeArrayOfSize(1);

    expect(row1transformers[0].querySelectorAll('text')[0].textContent).toEqual('MyThirdAnalytic');

    expect(Array.from(row1.querySelectorAll('.channels > .inChannel'))).toBeArrayOfSize(3);
    expect(Array.from(row1.querySelectorAll('.channels > .outChannel'))).toBeArrayOfSize(1);
    expect(Array.from(row1.querySelectorAll('.channels > .inChannel .placeholder-channel'))).toBeArrayOfSize(2);
    expect(Array.from(row1.querySelectorAll('.channels > .outChannel .placeholder-channel'))).toBeArrayOfSize(1);
  });


  it('ISSUE-127804: On a config reload the input and output channels and transformers should be redrawn correctly', () => {
    const config = new ConfigBuilder()
      .Name("Single row with a single Analytic containing two input channels and two output channels")
      .Description("This configuration demonstrates a single row with a single Analytic containing two input channels and two output channels")
      .withRow()
        .MaxTransformerCount(3)
        .withTransformer()
          .Name("My First Analytic")
          .withInputChannel().Name("Input Channel 1").endWith()
          .withOutputChannel().Name("Output Channel 1").endWith()
        .endWith()
      .endWith()
      .build();

    dataService.hierarchy.next(config);
    fixture.detectChanges();

    const config2 = new ConfigBuilder()
      .Name("Single row with a single Analytic containing two input channels and two output channels")
      .Description("This configuration demonstrates a single row with a single Analytic containing two input channels and two output channels")
      .withRow()
        .MaxTransformerCount(3)
        .withInputChannel().Name("OverriddenInput").endWith()
        .withOutputChannel().Name("OverriddenOutput").endWith()
        .withTransformer()
          .Name("My Second Analytic")
          .withInputChannel().Name("InChannel0").endWith()
          .withOutputChannel().Name("OutChannel0").endWith()
          .withInputChannel().Name("InChannel1").endWith()
          .withOutputChannel().Name("OutChannel1").endWith()
        .endWith()
      .endWith()
      .build();

    dataService.hierarchy.next(config2);
    fixture.detectChanges();

    const inChannels = Array.from(el.querySelectorAll('.channels > .inChannel'));
    expect(inChannels).toBeArrayOfSize(2);
    expect(Array.from(inChannels[0].querySelectorAll('.placeholder-channel'))).toBeEmptyArray();
    expect(Array.from(inChannels[1].querySelectorAll('.placeholder-channel'))).toBeArrayOfSize(1);
    expect(inChannels[0].querySelectorAll('text')[0].textContent).toEqual(`OverriddenInput`);
    expect(inChannels[1].querySelectorAll('text')[0].textContent).toEqual(`InChannel1`);

    const outChannels = Array.from(el.querySelectorAll('.channels > .outChannel'));
    expect(outChannels).toBeArrayOfSize(2);
    expect(Array.from(outChannels[0].querySelectorAll('.placeholder-channel'))).toBeEmptyArray();
    expect(Array.from(outChannels[1].querySelectorAll('.placeholder-channel'))).toBeArrayOfSize(1);
    expect(outChannels[0].querySelectorAll('text')[0].textContent).toEqual(`OverriddenOutput`);
    expect(outChannels[1].querySelectorAll('text')[0].textContent).toEqual(`OutChannel1`);

    const transformerName = Array.from(el.querySelectorAll('.transformer > text'));
    expect(transformerName).toBeArrayOfSize(1);
    expect(transformerName[0].textContent).toEqual("My Second Analytic");

  });

  describe('should draw appropriate drop targets when dragging a Transformer', () => {
    [
      { description: "RowSize: 1, Transformers: 0", setup: (row: RowBuilder): RowBuilder => row.MaxTransformerCount(1), dropTargetCount: 1 }, {
        description: "RowSize: 1, Transformers: 1",
        setup: (row: RowBuilder): RowBuilder => {
          return row.MaxTransformerCount(1)
            .withTransformer()
              .withInputChannel().endWith()
              .withOutputChannel().endWith()
            .endWith()
        },
        dropTargetCount: 0,
      },{
        description: "RowSize: 2, Transformers: 1",
        setup: (row: RowBuilder): RowBuilder => {
          return row.MaxTransformerCount(2)
            .withTransformer()
              .withInputChannel().endWith()
              .withOutputChannel().endWith()
            .endWith()
        },
        dropTargetCount: 2
      },{
        description: "RowSize: 2, Transformers: 1 (Multiple Inputs)",
        setup: (row: RowBuilder): RowBuilder => {
          return row.MaxTransformerCount(2)
            .withTransformer()
              .withInputChannel().endWith()
              .withInputChannel().endWith()
              .withOutputChannel().endWith()
            .endWith()
        },
        dropTargetCount: 0
      },{
        description: "RowSize: 2, Transformers: 1 (Multiple Outputs)",
        setup: (row: RowBuilder): RowBuilder => {
          return row.MaxTransformerCount(2)
            .withTransformer()
              .withInputChannel().endWith()
              .withOutputChannel().endWith()
              .withOutputChannel().endWith()
            .endWith()
        },
        dropTargetCount: 0
      }
    ].forEach((testCase) => {
      it(testCase.description + ', DropTargets: ' + testCase.dropTargetCount, () => {
        const config = (testCase.setup(new ConfigBuilder().withRow()) as NestedRowBuilder<ConfigBuilder>).endWith().build();

        dataService.hierarchy.next(config);
        fixture.detectChanges();

        // Create a temporary dom element and transformer to simulate that one has been dragged
        const dragEl = TestUtils.withTempSvg().append('rect').attr('width', 100).attr('height', 100).node() as SVGRectElement;
        dragService.startDrag({ sourceElement: dragEl, object: new TransformerBuilder().withInputChannel().endWith().withOutputChannel().endWith().build() });

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
            .withTransformer().withInputChannel().endWith().withOutputChannel().endWith().endWith()
            .withTransformer().withInputChannel().endWith().withOutputChannel().endWith().endWith()
          .endWith()
          .build();

        dataService.hierarchy.next(config);
        fixture.detectChanges();

        // Create a temporary dom element and transformer to simulate that one has been dragged
        const dragEl = TestUtils.withTempSvg().append('rect').attr('width', 100).attr('height', 100).node() as SVGRectElement;
        const dragTransformer = new TransformerBuilder().withInputChannel().endWith().withOutputChannel().endWith().build();
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
        .withTransformer().withInputChannel().endWith().withOutputChannel().endWith().endWith()
        .withTransformer().withInputChannel().endWith().withOutputChannel().endWith().endWith()
        .withTransformer().withInputChannel().endWith().withOutputChannel().endWith().endWith()
      .endWith()
      .build();

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

    expect((dragService.dragging.getValue() as Dragged).object).toBe(transformers[0]);
    expect(Array.from(el.querySelectorAll('.transformer'))).toBeArrayOfSize(3); // Still present until mouse leaves
    expect(Array.from(el.querySelectorAll('.drop-target'))).toBeArrayOfSize(0); // No spaces until this transformer has been removed from the sequence (on mouseleave)

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
    expect(Array.from(el.querySelectorAll('.drop-target'))).toBeArrayOfSize(0);
    const newTransformerEls = Array.from(el.querySelectorAll('.transformer'));
    expect(newTransformerEls).toBeArrayOfSize(3);
    const newTransformers = newTransformerEls.map((transEl) => (d3.select(transEl).datum() as any).transformer);
    expect(newTransformers).toEqual([transformers[1], transformers[2], transformers[0]]);
  });

  it('should not allow dragging of placeholder channels', () => {
    const config = new ConfigBuilder()
      .withRow()
        .MaxTransformerCount(1)
        .withTransformer().withInputChannel().endWith().withOutputChannel().endWith().endWith()
      .endWith()
      .build();

    dataService.hierarchy.next(config);
    fixture.detectChanges();

    const inChannel = Array.from(el.querySelectorAll('.inChannel .channel'))[0];
    const outChannel = Array.from(el.querySelectorAll('.outChannel .channel'))[0];

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

  describe('should allow dragging/dropping of existing channels', () => {
    [
      {
        description: 'inputChannel dropped on output placeholder',
        inputChannel: new ChannelBuilder().build(),
        outputChannel: undefined,
        fromSelector: '.inChannel .channel',
        toSelector: '.outChannel .channel'
      },{
        description: 'outputChannel dropped on input placeholder',
        inputChannel: undefined,
        outputChannel: new ChannelBuilder().build(),
        fromSelector: '.outChannel .channel',
        toSelector: '.inChannel .channel'
      },{
        description: 'inputChannel dropped on outputChannel',
        inputChannel: new ChannelBuilder().build(),
        outputChannel: new ChannelBuilder().build(),
        fromSelector: '.inChannel .channel',
        toSelector: '.outChannel .channel'
      },{
        description: 'outputChannel dropped on inputChannel',
        inputChannel: new ChannelBuilder().build(),
        outputChannel: new ChannelBuilder().build(),
        fromSelector: '.outChannel .channel',
        toSelector: '.inChannel .channel'
      },{
        description: 'inputChannel dropped on inputChannel',
        inputChannel: new ChannelBuilder().build(),
        outputChannel: undefined,
        fromSelector: '.inChannel .channel',
        toSelector: '.inChannel .channel'
      },{
        description: 'outputChannel dropped on outputChannel',
        inputChannel: undefined,
        outputChannel: new ChannelBuilder().build(),
        fromSelector: '.outChannel .channel',
        toSelector: '.outChannel .channel'
      },
    ].forEach((testCase) => {
      it(testCase.description, () => {
        const config = new ConfigBuilder()
          .withRow()
            .MaxTransformerCount(1)
            .pushInputChannel(testCase.inputChannel)
            .pushOutputChannel(testCase.outputChannel)
            .withTransformer().withInputChannel().endWith().withOutputChannel().endWith().endWith()
          .endWith()
          .build();

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
        expect((d3.select(el.querySelectorAll(testCase.fromSelector)[0]).datum() as any).channel).toEqual(jasmine.any(TransformerChannelDef)); // Replaced with placeholder

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
