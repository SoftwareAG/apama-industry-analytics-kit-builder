import {async, TestBed} from "@angular/core/testing";
import {AppComponent} from "./app.component";
import {AppModule} from "./app.module";
import {MetadataBuilder} from "./classes/Metadata";
import {Config, ConfigBuilder} from "./classes/Config";
import {AbstractMetadataService, MetadataService} from "./services/MetadataService";
import {DataService} from "./services/DataService";
import {AbstractDataService} from "./services/AbstractDataService";
import {TransformerBuilder} from "./classes/Transformer";

describe('AppComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [
        {provide: AbstractDataService, useClass: DataService},
        {provide: AbstractMetadataService, useClass: MetadataService},
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should not display [Unsaved] if no configuration changes have been made', () => {
    const dataService = TestBed.get(AbstractDataService) as DataService;
    const fixture = TestBed.createComponent(AppComponent);
    const el = fixture.debugElement.nativeElement;
    dataService.isModified().subscribe(modified => expect(modified).toBeFalse());
    expect(el.querySelector('.unsaved')).toBeNull();
  });

  it('should not display [Unsaved] when the configuration has been replaced', () => {
    const dataService = TestBed.get(AbstractDataService) as DataService;
    const metadataService = TestBed.get(AbstractMetadataService) as MetadataService;
    const fixture = TestBed.createComponent(AppComponent);
    const el = fixture.debugElement.nativeElement;

    const metadata = new MetadataBuilder()
      .withAnalytic()
      .Name('Analytic1')
      .withInputChannel().Name('InChannel0').endWith()
      .withOutputChannel().Name('OutChannel0').endWith()
      .endWith()
      .build();

    const config: Config = new ConfigBuilder()
      .withRow()
      .MaxTransformerCount(4)
      .pushTransformer(metadata.createAnalytic("Analytic1"))
      .withInputChannel(0).Name('UserIn').endWith()
      .withOutputChannel(0).Name('UserOut').endWith()
      .endWith()
      .build();

    metadataService.metadata.next(metadata);
    dataService.hierarchy.next(config);
    fixture.detectChanges();
    expect(el.querySelector('.unsaved')).toBeNull();
    dataService.isModified().subscribe(modified => expect(modified).toBeFalse());
  });

  it('should display [Unsaved] when the configuration has been updated', () => {
    const dataService = TestBed.get(AbstractDataService) as DataService;
    const metadataService = TestBed.get(AbstractMetadataService) as MetadataService;
    const fixture = TestBed.createComponent(AppComponent);
    const el = fixture.debugElement.nativeElement;

    const metadata = new MetadataBuilder()
      .withAnalytic()
      .Name('Analytic1')
      .withInputChannel().Name('InChannel0').endWith()
      .withOutputChannel().Name('OutChannel0').endWith()
      .endWith()
      .build();

    metadataService.metadata.next(metadata);
    dataService.hierarchy.getValue().addRow(TransformerBuilder.fromTransformerDef(metadata.getAnalytic('Analytic1')).build());
    fixture.detectChanges();
    expect(el.querySelector('.unsaved')).toBeDefined();
    dataService.isModified().subscribe(modified => expect(modified).toBeTrue());
  });
});


