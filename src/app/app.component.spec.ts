import {async, TestBed} from "@angular/core/testing";

import {AppComponent} from "./app.component";
import {ChannelSelectorComponent} from "./widgets/channel-selector/channel-selector.component";
import {TransformerSelectorComponent} from "./widgets/transformer-selector/transformer-selector.component";
import {TransformerPropertySelectorComponent} from "./widgets/transformer-property-selector/transformer-property-selector.component";
import {LadderDiagramComponent} from "./widgets/ladder-diagram/ladder-diagram.component";
import {AbstractDataService} from "./services/AbstractDataService";
import {DataService} from "./services/DataService";
import {NavBarComponent} from "./widgets/nav-bar/nav-bar.component";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        ChannelSelectorComponent,
        TransformerSelectorComponent,
        LadderDiagramComponent,
        TransformerSelectorComponent,
        TransformerPropertySelectorComponent,
        NavBarComponent
      ],
      providers: [
        {provide: AbstractDataService, useClass: DataService}
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  // it(`should have as title 'app works!'`, () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.debugElement.componentInstance;
  //   expect(app.title).toEqual('app works!');
  // });
  //
  // it('should render title in a h1 tag', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain('app works!');
  // });
});
