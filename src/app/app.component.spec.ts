import { TestBed, async } from '@angular/core/testing';

import { AppComponent } from './app.component';
import {ChannelSelectorComponent} from "./widgets/channel-selector/channel-selector.component";
import {TransformerSelectorComponent} from "./widgets/transformer-selector/transformer-selector.component";
import {AbstractMetadataService} from "./services/AbstractMetadataService";
import {AbstractChannelDataService} from "./services/AbstractChannelDataService";
import {AsyncMetadataServiceMock} from "./services/AsyncMetadataServiceMock";
import {AsyncChannelDataServiceMock} from "./services/AsyncChannelMetadataServiceMock";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        ChannelSelectorComponent,
        TransformerSelectorComponent
      ],
      providers: [
        {provide: AbstractMetadataService, useClass: AsyncMetadataServiceMock},
        {provide: AbstractChannelDataService, useClass: AsyncChannelDataServiceMock}
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'app works!'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app works!');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('app works!');
  });
});
