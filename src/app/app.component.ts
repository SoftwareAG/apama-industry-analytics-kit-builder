import {AfterViewInit, Component} from "@angular/core";
import {AbstractDataService} from "./services/AbstractDataService";
import {AbstractMetadataService} from "./services/MetadataService";
import {ResizeEvent} from "angular-resizable-element";
import {LoginDialogComponent} from "./widgets/login-dialog/login-dialog.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Http} from "@angular/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  private readonly _informationHeightMax = 85;
  private readonly _informationHeightMin = 15;

  // Initial height split for Ladder Diagram and Information
  informationHeightPercent = 25;
  ladderDiagramHeightPercent = 75;

  // Used in css
  ladderDiagramHeightPercentString = this.ladderDiagramHeightPercent + "%";
  informationHeightPercentString = this.informationHeightPercent + "%";

  informationHeightStartPixels = 0;

  constructor(private dataService: AbstractDataService, private metadataService: AbstractMetadataService, public modalService: NgbModal, private http: Http) { }

  onValidateResize(event: ResizeEvent): boolean {
    if (event.rectangle) {
      if (event.rectangle.top <= 0) {
        event.rectangle.top = 0;
        return false;
      }
    }
    return true;
  }

  onResizeStart(event: ResizeEvent): void {
    this.informationHeightStartPixels = event.rectangle.height || 0;
  }

  onResizeEnd(event: ResizeEvent): void {
    if (event.rectangle.height) {
      const diff = (event.rectangle.height - this.informationHeightStartPixels) / this.informationHeightStartPixels;
      this.informationHeightPercent = this.informationHeightPercent + (this.informationHeightPercent * diff);
      this.informationHeightPercent = this.informationHeightPercent > this._informationHeightMax ? this._informationHeightMax : this.informationHeightPercent;
      this.informationHeightPercent = this.informationHeightPercent < this._informationHeightMin ? this._informationHeightMin : this.informationHeightPercent;
      this.ladderDiagramHeightPercent = 100 - this.informationHeightPercent;
      this.ladderDiagramHeightPercentString = this.ladderDiagramHeightPercent + "%";
      this.informationHeightPercentString = this.informationHeightPercent + "%";
    }
  }

  openLoginDialog() {
    this.modalService.open(LoginDialogComponent, {size: "lg", backdrop: "static", keyboard: false});
  }

  loadDefaultMetadata() {
    this.http.get('assets/metadata.json')
      .toPromise()
      .then( (result => {
          this.metadataService.loadMetadata(result.json())
      }))
      .catch(err => console.log(err));
  }

  ngAfterViewInit() {
    window.setTimeout(() => {
      this.loadDefaultMetadata();
      this.openLoginDialog()
    });
  }
}
