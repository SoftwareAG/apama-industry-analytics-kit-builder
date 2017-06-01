import {AfterViewInit, Component} from "@angular/core";
import {AbstractDataService} from "./services/AbstractDataService";
import {DataService} from "./services/DataService";
import {AbstractMetadataService} from "./services/MetadataService";
import {MetadataBuilder} from "./classes/Metadata";
import {ResizeEvent} from "angular-resizable-element";
import {ConfigBuilder} from "./classes/Config";
import {LoginDialogComponent} from "./widgets/login-dialog/login-dialog.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

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

  constructor(dataService: AbstractDataService, metadataService: AbstractMetadataService, public modalService: NgbModal) {
    (dataService as DataService).loadChannels();

    metadataService.metadata.next(new MetadataBuilder()
      .Version("1.0.0")
      .withAnalytic()
        .Name("Sorter")
        .Group("Group1")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("NoInput")
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("NoOutput")
        .withInputChannel().Name("In1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("Drift")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("Spike")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("Threshold")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("Delta")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("Gradient")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("Average")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("Sum")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("Mode")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith()
      .withAnalytic()
        .Name("Spread")
        .withInputChannel().Name("In1").Description("").endWith()
        .withOutputChannel().Name("Out1").Description("").endWith()
      .endWith().build()
    );

     dataService.configurations.next(dataService.configurations.getValue().push(() => {
      return new ConfigBuilder()
        .Name("Peer Analysis")
        .Description("")
        .withRow()
          .MaxTransformerCount(3)
          .pushTransformer(metadataService.createAnalytic('Average'))
        .endWith()
        .withRow()
          .MaxTransformerCount(3)
          .pushTransformer(metadataService.createAnalytic('Spread'))
          .pushTransformer(metadataService.createAnalytic('Threshold'))
        .endWith()
        .build()
     }));
  }

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

  ngAfterViewInit() {
    this.openLoginDialog();
  }
}
