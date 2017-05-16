import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {Injectable} from "@angular/core";
import {RowChannel, ChannelArrayBuilder} from "../../classes/Channel";
import {ChannelSelectorComponent} from "./channel-selector.component";
import {AbstractDataService} from "../../services/AbstractDataService";
import {BehaviorSubject} from "rxjs";
import {TransformerDef} from "../../classes/TransformerDef";
import {Config} from "../../classes/Config";
import {List} from "immutable";
import {Transformer} from "app/classes/Transformer";
import {AbstractDragService, Draggable, Dragged, Point} from "../../services/AbstractDragService";

@Injectable()
class DataServiceMock extends AbstractDataService {}

@Injectable()
class DragServiceMock extends AbstractDragService {
  startDrag(draggable: Draggable) {}
  stopDrag(): Dragged | undefined { return undefined; }
  drag(newLocation: Point) {}
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
        {provide: AbstractDataService, useClass: DataServiceMock},
        {provide: AbstractDragService, useClass: DragServiceMock}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    channelDataService = TestBed.get(AbstractDataService) as DataServiceMock;

    channelDataService.channels.next(List<RowChannel>());
    fixture = TestBed.createComponent(ChannelSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
  });

  it('should have an svg child element', () => {
    expect(el.children[2].nodeName).toEqual('svg');
  });

  it('should create transformer elements', () => {
    const channels = List(new ChannelArrayBuilder()
        .with().Name('Default 1').endWith()
        .with().Name('Default 2').endWith()
        .with().Name('Default 3').endWith()
        .with().Name('Default 4').endWith()
        .with().Name('Default 5').endWith()
      .build());

    channelDataService.channels.next(channels);
    fixture.detectChanges();
    expect(Array.from(el.querySelectorAll('.channel'))).toBeArrayOfSize(5);
    Array.from(el.querySelectorAll('.channel')).forEach((channelEl, i) => {
      expect((channelEl.querySelector('text') as Element).textContent).toEqual(channels.get(i).name.getValue());
    });
  });
});
