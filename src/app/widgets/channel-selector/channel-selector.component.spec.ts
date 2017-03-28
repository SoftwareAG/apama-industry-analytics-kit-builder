import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {Injectable} from "@angular/core";
import {AbstractChannelDataService} from "../../services/AbstractChannelDataService";
import {Channel} from "../../classes/Channel";
import {ChannelSelectorComponent} from "./channel-selector.component";


@Injectable()
class SynchronousChannelDataServiceMock implements AbstractChannelDataService {
  //noinspection JSMethodCanBeStatic
  getChannels() {

    return [
      new Channel({name: 'Default'}),
      new Channel({name: 'Channel 1'}),
      new Channel({name: 'Channel 2'}),
      new Channel({name: 'Channel 3'}),
      new Channel({name: 'Channel 4'})
    ]
  };

  withChannels(callback: (channels: Channel[]) => void) {
    callback(this.getChannels());
  }
}

describe('ChannelSelectorComponent', () => {
  let component: ChannelSelectorComponent;
  let fixture: ComponentFixture<ChannelSelectorComponent>;
  let el: HTMLElement;
  let channelDataService: AbstractChannelDataService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelSelectorComponent ],
      providers: [
        {provide: AbstractChannelDataService, useClass: SynchronousChannelDataServiceMock}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
    channelDataService = TestBed.get(AbstractChannelDataService);
  });

  it('should have an svg child element', () => {
    expect(el.children[0].nodeName).toEqual('svg');
  });

  it('should create transformer elements', () => {
    expect(el.querySelectorAll('.channel').length).toEqual(5);
    const channels = channelDataService.getChannels();
    Array.from(el.querySelectorAll('.channel')).forEach((channelEl, i) => {
      expect((channelEl.querySelector('text') as Element).textContent).toEqual(channels[i].name);
    });
  });
});
