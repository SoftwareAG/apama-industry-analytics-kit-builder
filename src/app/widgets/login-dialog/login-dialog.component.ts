import {Component, HostListener} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent {

  public u: string;
  public p: string;
  public invalid_username_password: boolean;

  readonly U: string = "demo";
  readonly P: string = "welcome1";
  readonly TAB = 9;

  private dialog;

  constructor(private activeModal: NgbActiveModal) {
    this.dialog = this;
  }

  login() {
    this.invalid_username_password = false;
    // Check for this hard coded username and password
    if (this.u === this.U && this.p === this.P) {
      this.activeModal.close('loginDialog');

    } else {
      this.invalid_username_password = true;
    }
  }

  processTab(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  processShiftTab(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

}
