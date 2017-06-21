import {Component} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {CookieService} from "ng2-cookies";

@Component({
  selector: 'app-login-dialog',
  providers: [CookieService],
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

  constructor(private activeModal: NgbActiveModal, private cookieService: CookieService) {
    this.dialog = this;
  }

  login() {
    this.invalid_username_password = false;
    // Check for this hard coded username and password
    if (this.u === this.U && this.p === this.P) {
      this.cookieService.set('loggedIn', 'true', 365);
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
