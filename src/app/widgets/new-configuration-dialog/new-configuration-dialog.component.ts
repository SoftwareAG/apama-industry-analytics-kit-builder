import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-new-configuration-dialog',
  templateUrl: './new-configuration-dialog.component.html',
  styleUrls: ['./new-configuration-dialog.component.scss']
})
export class NewConfigurationDialogComponent implements OnInit {

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() { }

  close(result: any) {
    this.activeModal.close(result);
  }

  dismiss(reason: any) {
    this.activeModal.close(reason);
  }

}
