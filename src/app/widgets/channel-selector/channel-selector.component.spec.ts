import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {Injectable} from "@angular/core";
import {Channel} from "../../classes/Channel";
import {ChannelSelectorComponent} from "./channel-selector.component";
import {AbstractDataService} from "../../services/AbstractDataService";
import {BehaviorSubject, Observable} from "rxjs";
import {TransformerDef} from "../../classes/TransformerDef";
import {Config} from "../../classes/Config";


@Injectable()
class DataServiceMock implements AbstractDataService {
  private _channels: BehaviorSubject<Channel[]> = new BehaviorSubject([]);

  readonly channels: Observable<Channel[]> = this._channels.asObservable();
  readonly transformers: Observable<TransformerDef[]>;
  readonly hierarchy: Observable<Config>;

  updateChannels(channels: Channel[]) {
    this._channels.next(channels);
  }
}

describe('ChannelSelectorComponent', () => {
  let component: ChannelSelectorComponent;
  let fixture: ComponentFixture<ChannelSelectorComponent>;
  let el: HTMLElement;
  let channelDataService: DataServiceMock;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelSelectorComponent ],
      providers: [
        {provide: AbstractDataService, useClass: DataServiceMock}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    channelDataService = TestBed.get(AbstractDataService) as DataServiceMock;
    channelDataService.updateChannels([]);
    fixture = TestBed.createComponent(ChannelSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
  });

  it('should have an svg child element', () => {
    expect(el.children[0].nodeName).toEqual('svg');
  });

  it('should create transformer elements', () => {
    const channels = [
      new Channel({name: 'Default'}),
      new Channel({name: 'Channel 1'}),
      new Channel({name: 'Channel 2'}),
      new Channel({name: 'Channel 3'}),
      new Channel({name: 'Channel 4'})
    ];
    channelDataService.updateChannels(channels);
    fixture.detectChanges();
    expect(el.querySelectorAll('.channel').length).toEqual(5);
    Array.from(el.querySelectorAll('.channel')).forEach((channelEl, i) => {
      expect((channelEl.querySelector('text') as Element).textContent).toEqual(channels[i].name);
    });
  });
});
