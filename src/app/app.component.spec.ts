import {async, TestBed} from "@angular/core/testing";

import {AppComponent} from "./app.component";
import {ChannelSelectorComponent} from "./widgets/channel-selector/channel-selector.component";
import {TransformerSelectorComponent} from "./widgets/transformer-selector/transformer-selector.component";
import {TransformerPropertySelectorComponent} from "./widgets/transformer-property-selector/transformer-property-selector.component";
import {LadderDiagramComponent} from "./widgets/ladder-diagram/ladder-diagram.component";
import {AbstractDataService} from "./services/AbstractDataService";
import {DataService} from "./services/DataService";
import {NavBarComponent} from "./widgets/nav-bar/nav-bar.component";
import {AbstractDragService} from "./services/AbstractDragService";
import {DragService} from "./services/DragService";
import {DragOverlayComponent} from "./widgets/dragoverlay/drag-overlay.component";
import {FormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {ConfigSerializer} from "./classes/Config";
import {RowSerializer} from "./classes/Row";
import {PropertySerializer} from "app/classes/Property";
import {TransformerSerializer} from "./classes/Transformer";

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
        NavBarComponent,
        DragOverlayComponent
      ],
      imports: [
        FormsModule,
        NgbModule.forRoot()
      ],
      providers: [
        {provide: AbstractDataService, useClass: DataService},
        {provide: AbstractDragService, useClass: DragService},
        ConfigSerializer,
        RowSerializer,
        TransformerSerializer,
        PropertySerializer

      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Analytics Builder'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Analytics Builder');
  });

});
