import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {NavBarComponent} from "./nav-bar.component";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Config, ConfigArrayBuilder, ConfigSerializer} from "../../classes/Config";
import {BehaviorSubject} from "rxjs";
import {List} from "immutable";
import {Injectable} from "@angular/core";
import {Transformer, TransformerSerializer} from "../../classes/Transformer";
import {FileService} from "../../services/FileService";
import {RowSerializer} from "../../classes/Row";
import {PropertyDeserializer, PropertySerializer} from "../../classes/Property";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {AbstractMetadataService, MetadataService} from "../../services/MetadataService";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {TransformerChannelDeserializer} from "../../classes/TransformerChannel";
import {ConfigDeserializer} from "../../classes/ConfigDeserializer";
import {RowDeserializer} from "../../classes/RowDeserializer";
import {TransformerDeserializer} from "../../classes/TransformerDeserializer";
import {SelectionService} from "../../services/SelectionService";
import {HistoryService} from "../../services/HistoryService";
import {Observable} from "rxjs/Observable";

@Injectable()
class DataServiceMock extends AbstractDataService {

  addAnalyticChannelsToChannelsPanel(transformer: Transformer) {};
  removeAnalyticChannelsFromChannelsPanel(transformer: Transformer) {};
  addChannel(channelName: string) {};

  readonly configurations: BehaviorSubject<List<() => Config>> = new BehaviorSubject(List<() => Config>(()=>new ConfigArrayBuilder()
    .with()
      .Name("Config1")
      .Description("Config1Desc")
    .endWith()
    .with()
      .Name("Config2")
      .Description("Config2Desc")
    .endWith()
    .with()
      .Name("Config3")
      .Description("Config3Desc")
    .endWith()
    .with()
      .Name("Config4")
      .Description("Config4Desc")
    .endWith()
    .build()
  ));

  setModified(modifiedValue: boolean) {};
  isModified(): Observable<boolean> { return new BehaviorSubject<boolean>(false)};
}

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let el: HTMLElement;
  let dataService: DataServiceMock;

  let configurations: Config[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavBarComponent],
      providers: [
        {provide: AbstractDataService, useClass: DataServiceMock},
        {provide: AbstractMetadataService, useClass: MetadataService},
        HistoryService,
        SelectionService,
        FileService,
        ConfigSerializer,
        RowSerializer,
        TransformerSerializer,
        PropertySerializer,
        ConfigDeserializer,
        RowDeserializer,
        TransformerDeserializer,
        TransformerChannelDeserializer,
        PropertyDeserializer
      ],
      imports: [
        BrowserModule,
        FormsModule,
        NgbModule.forRoot()
      ]
      })
  }));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    dataService = TestBed.get(AbstractDataService) as DataServiceMock;
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render Navbar title as "Analytics Builder"', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#navbar-title').text).toContain('Analytics Builder');
  });

  it('should correctly display example configurations in the dropdown', () => {
    fixture.detectChanges();
    const configurations = Array.from(el.querySelectorAll('.examples .dropdown-menu > .dropdown-item'));

    expect(configurations).toBeArrayOfSize(0);
    expect (configurations.length).toEqual(dataService.configurations.getValue().size);

  });

});
