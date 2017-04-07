import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import * as d3 from "d3";
import {Injectable} from "@angular/core";
import {AbstractDataService} from "../../services/AbstractDataService";
import {BehaviorSubject, Observable} from "rxjs";
import {Channel} from "../../classes/Channel";
import {TransformerDef} from "../../classes/TransformerDef";
import {Config, ConfigBuilder} from "app/classes/Config";
import {LadderDiagramComponent} from "./ladder-diagram.component";
import {Transformer} from "../../classes/Transformer";

@Injectable()
class DataServiceMock implements AbstractDataService {
  private _hierarchy: BehaviorSubject<Config> = new BehaviorSubject(new ConfigBuilder().build());

  readonly channels: Observable<Channel[]>;
  readonly transformers: Observable<TransformerDef[]>;
  readonly hierarchy: Observable<Config> = this._hierarchy.asObservable();
  readonly selectedTransformer: BehaviorSubject<Transformer | undefined>;

  updateHierarchy(hierarchy: Config) {
    this._hierarchy.next(hierarchy);
  }

}

describe('LadderDiagramComponent', () => {
  let component: LadderDiagramComponent;
  let fixture: ComponentFixture<LadderDiagramComponent>;
  let el: HTMLElement;
  let dataService: DataServiceMock;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LadderDiagramComponent ],
      providers: [
        {provide: AbstractDataService, useClass: DataServiceMock}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    dataService = TestBed.get(AbstractDataService) as DataServiceMock;
    dataService.updateHierarchy(new ConfigBuilder().build());
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

      dataService.updateHierarchy(config);
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

      dataService.updateHierarchy(config);
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

        dataService.updateHierarchy(config);
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

        dataService.updateHierarchy(config);
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

        dataService.updateHierarchy(config);
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

    dataService.updateHierarchy(config);
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
        .withInputChannel().Name("Input Channel 1").endWith()
        .withOutputChannel().Name("Output Channel 1").endWith()
        .withTransformer()
          .Name("My First Analytic")
        .endWith()
      .endWith()
      .build();

    dataService.updateHierarchy(config);
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

    dataService.updateHierarchy(config2);
    fixture.detectChanges();

    const inChannels = Array.from(el.querySelectorAll('.channels > .inChannel'));
    expect(inChannels).toBeArrayOfSize(2);
    expect(inChannels[0].querySelectorAll('text')[0].textContent).toEqual(`OverriddenInput`);
    expect(inChannels[1].querySelectorAll('text')[0].textContent).toEqual(`InChannel1`);

    const outChannels = Array.from(el.querySelectorAll('.channels > .outChannel'));
    expect(outChannels).toBeArrayOfSize(2);
    expect(outChannels[0].querySelectorAll('text')[0].textContent).toEqual(`OverriddenOutput`);
    expect(outChannels[1].querySelectorAll('text')[0].textContent).toEqual(`OutChannel1`);

    const transformerName = Array.from(el.querySelectorAll('.transformer > text'));
    expect(transformerName).toBeArrayOfSize(1);
    expect(transformerName[0].textContent).toEqual("My Second Analytic");

  });

});
