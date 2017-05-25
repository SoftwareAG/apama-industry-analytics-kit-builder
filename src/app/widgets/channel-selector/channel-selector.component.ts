import {Component} from "@angular/core";
import {RowChannel, RowChannelBuilder} from "../../classes/Channel";
import {AbstractDataService} from "../../services/AbstractDataService";
import {List} from "immutable";
import {AbstractDragService} from "../../services/AbstractDragService";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
  templateUrl: './channel-selector.component.html',
  selector: 'channel-selector',
  styleUrls: ['./channel-selector.component.scss']
})
export class ChannelSelectorComponent {
  readonly nativeElement;
  readonly channels: BehaviorSubject<List<RowChannel>>;
  readonly dragService: AbstractDragService;

  addChannelName: string = "";

  constructor(dataService: AbstractDataService, dragService: AbstractDragService) {
    this.channels = dataService.channels;
    this.dragService = dragService;
  }

  onChannelDrag(event, channel) {
    this.dragService.startDrag({sourceElement: event.srcElement.parentNode, object: channel});
    event.preventDefault();
  }

  addChannel(channelName: string) {
    this.channels.next(this.channels.getValue().push(new RowChannelBuilder().Name(channelName).build()));
  }
}
