import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {NavBarComponent} from "./nav-bar.component";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Config, ConfigArrayBuilder, ConfigSerializer} from "../../classes/Config";
import {BehaviorSubject} from "rxjs";
import {Channel} from "../../classes/Channel";
import {List} from "immutable";
import {Injectable} from "@angular/core";
import {TransformerDef} from "../../classes/TransformerDef";
import {Transformer, TransformerSerializer} from "../../classes/Transformer";
import {FileService} from "../../services/FileService";
import {RowSerializer} from "../../classes/Row";
import {PropertySerializer} from "../../classes/Property";

@Injectable()
class DataServiceMock implements AbstractDataService {
  readonly configurations: BehaviorSubject<List<Config>> = new BehaviorSubject(List(new ConfigArrayBuilder()
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

  readonly channels: BehaviorSubject<List<Channel>>;
  readonly transformers: BehaviorSubject<List<TransformerDef>>;
  readonly hierarchy: BehaviorSubject<Config>;
  readonly selectedTransformer: BehaviorSubject<Transformer | undefined>;
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
        FileService,
        ConfigSerializer,
        RowSerializer,
        TransformerSerializer,
        PropertySerializer
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
    const configurations = Array.from(el.querySelectorAll('.dropdown-menu > .dropdown-item'));

    expect(configurations).toBeArrayOfSize(4);
    expect (configurations.length).toEqual(dataService.configurations.getValue().size);

  });

});
