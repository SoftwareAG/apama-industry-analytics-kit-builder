import {AfterContentInit, AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {RowChannel} from "../../classes/Channel";
import {SelectionService} from "../../services/SelectionService";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Scheduler} from "rxjs/Rx";

@Component({
  selector: 'channel-property-selector',
  templateUrl: './channel-property-selector.component.html',
  styleUrls: ['./channel-property-selector.component.scss']
})
export class ChannelPropertySelectorComponent implements AfterViewInit {
  @ViewChild('name') nameInput: ElementRef;
  selectedChannelName: BehaviorSubject<string>;

  constructor(private selectionService: SelectionService) {
    this.selectionService.selection.takeWhile(selection => selection instanceof RowChannel).subscribe((selection: RowChannel) => this.selectedChannelName = selection.name);
  }

  ngAfterViewInit() {
    this.selectionService.selection.takeWhile(selection => selection instanceof RowChannel)
      .observeOn(Scheduler.async) // Make sure the view is re-rendered before attempting to select (Otherwise the input won't have any text in it)
      .subscribe(() => {
        this.nameInput.nativeElement.focus();
        this.nameInput.nativeElement.select();
      });
  }
}
