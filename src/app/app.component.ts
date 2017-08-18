import {AfterViewInit, Component, HostListener, ViewChild} from "@angular/core";
import {AbstractDataService} from "./services/AbstractDataService";
import {AbstractMetadataService} from "./services/MetadataService";
import {ResizeEvent} from "angular-resizable-element";
import {Http} from "@angular/http";
import {CookieService} from "ng2-cookies";
import {SandboxEvalComponent} from "./widgets/sandbox-eval/sandbox-eval.component";
import {SandboxEvalService} from "./services/SandboxEvalService";
import {AbstractDragService, Dragged, Point} from "./services/AbstractDragService";
import * as _ from "lodash";

@Component({
  selector: 'app-root',
  providers: [CookieService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild(SandboxEvalComponent) sandboxEvalComponent: SandboxEvalComponent;

  private readonly _informationHeightMax = 85;
  private readonly _informationHeightMin = 15;

  // Initial height split for Ladder Diagram and Information
  informationHeightPercent = 25;
  ladderDiagramHeightPercent = 75;

  // Used in css
  ladderDiagramHeightPercentString = this.ladderDiagramHeightPercent + "%";
  informationHeightPercentString = this.informationHeightPercent + "%";

  informationHeightStartPixels = 0;

  constructor(private dataService: AbstractDataService, private metadataService: AbstractMetadataService, private http: Http,
              private sandboxEvalService: SandboxEvalService, private dragService: AbstractDragService) { }

  @HostListener('window:beforeunload', ['$event'])
  checkforUnsavedConfiguration($event) {
    this.dataService.isModified().first().subscribe(modified => {
      if (modified) {
        $event.preventDefault();
        $event.cancelBubble = true;
        $event.returnValue = 'Your configuration changes will be lost';
      }
    })
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

  loadDefaultMetadata() {
    this.http.get('assets/metadata.json')
      .toPromise()
      .then( (result => {
          this.metadataService.loadMetadata(result.json());
      }))
      .catch(err => console.log(err));
  }

  onMouseMoveLadderDiagramPanel(event: MouseEvent) {
    if (this.dragService.dragging.getValue()) {

      // Get the height of the ladder-diagram-panel
      const ladderDiagramPanelElement:Element | null = document.querySelector('#ladder-diagram-panel');
      if (ladderDiagramPanelElement) {
        const ladderDiagramPanelHTMLElement = (ladderDiagramPanelElement as HTMLElement);
        const ladderDiagramPanelHeight = ladderDiagramPanelHTMLElement.clientHeight;

        // If the mouse y is greater than the ladder-diagram-panel height, scroll the div
        if (event.pageY > ladderDiagramPanelHeight) {
          console.info(`scrolling down..`);
          console.info(`  ladderDiagramPanelHeight is ${ladderDiagramPanelHeight}`);
          console.info(`  event.pageY is ${event.pageY}`);

          // TODO: scroll down needs to include the height of the object (analytic) being dragged
          // Auto scroll down
          ladderDiagramPanelHTMLElement.scrollTop += (event.pageY - ladderDiagramPanelHeight);
        }

        // If the mouse y is less than the current scrollTop
        if ((event.pageY - 75) < ladderDiagramPanelHTMLElement.scrollTop) {
          console.info(`scrolling up..`);
          console.info(`  ladderDiagramPanelHeight is ${ladderDiagramPanelHeight}`);
          console.info(`  event.pageY is ${event.pageY}`);
          console.info(`  ladderDiagramPanelHTMLElement.scrollTop is ${ladderDiagramPanelHTMLElement.scrollTop}`);

          // Auto scroll up
          ladderDiagramPanelHTMLElement.scrollTop -= 20;
        }
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadDefaultMetadata();
    });
    this.sandboxEvalService.registerComponent(this.sandboxEvalComponent);


  }
}
