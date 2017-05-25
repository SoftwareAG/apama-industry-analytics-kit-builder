import {Component, Input} from "@angular/core";

@Component({
  selector: 'row-channel',
  templateUrl: './row-channel.component.html',
  styleUrls: ['./row-channel.component.scss']
})
export class RowChannelComponent {
  @Input() name: string;
  @Input() width: number = 210;
  @Input() height: number = 50;
}
