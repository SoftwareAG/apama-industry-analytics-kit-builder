import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {NavBarComponent} from "./nav-bar.component";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Config} from "../../classes/Config";
import {DataService} from "../../services/DataService";

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let el: HTMLElement;
  let dataService: DataService;

  let configurations: Config[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavBarComponent],
      providers: [
        {provide: AbstractDataService, useClass: DataService}
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
    dataService = TestBed.get(AbstractDataService) as DataService;
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
    dataService.loadConfigurations();
    fixture.detectChanges();
    const configurations = Array.from(el.querySelectorAll('.dropdown-menu > .dropdown-item'));

    expect(configurations).toBeArrayOfSize(4);
    expect (configurations.length).toEqual(dataService.configurations.getValue().size);

  });

});
