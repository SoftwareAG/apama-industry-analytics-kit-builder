import {AfterViewInit, Component, HostListener, ViewChild} from "@angular/core";
import {AbstractDataService} from "./services/AbstractDataService";
import {AbstractMetadataService} from "./services/MetadataService";
import {ResizeEvent} from "angular-resizable-element";
import {Http} from "@angular/http";
import {CookieService} from "ng2-cookies";
import {SandboxEvalComponent} from "./widgets/sandbox-eval/sandbox-eval.component";
import {SandboxEvalService} from "./services/SandboxEvalService";
import {AbstractDragService, Dragged, Point} from "./services/AbstractDragService";

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

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadDefaultMetadata();
    });
    this.sandboxEvalService.registerComponent(this.sandboxEvalComponent);

    // TODO: What I want to do is....
    // When the dragService.dragging is updated
    // and the dragged item enters the ladder diagram panel
    // subscribe and listen for currentLocation changes
    this.dragService.dragging
      .filter((dragged) => { return !!dragged}) // only interested when we're dragging something
      .switchMap((dragged: Dragged) => dragged.currentLocation) // once we're dragging something, subscribe to the dragged objects currentLocation changes
      .subscribe((currentLocation: Point) => {

        // Get the height of the ladder-diagram-panel
        const ladderDiagramPanelElement:Element | null = document.querySelector('#ladder-diagram-panel');
        if (ladderDiagramPanelElement) {
          const ladderDiagramPanelHTMLElement = (ladderDiagramPanelElement as HTMLElement);
          const ladderDiagramPanelHeight = ladderDiagramPanelHTMLElement.clientHeight;

          // If the mouse y is greater than the ladder-diagram-panel height, scroll the div
          if (currentLocation.y > ladderDiagramPanelHeight) {
            // Auto scroll down
            ladderDiagramPanelHTMLElement.scrollTop += (currentLocation.y - ladderDiagramPanelHeight);
          }

          // If the mouse y is less than the current scrollTop
          if (currentLocation.y < ladderDiagramPanelHTMLElement.scrollTop) {
            console.info(`ladderDiagramPanelHeight is ${ladderDiagramPanelHeight}`);
            console.info(`currentLocation.y is ${currentLocation.y}`);
            console.info(`ladderDiagramPanelHTMLElement.scrollTop is ${ladderDiagramPanelHTMLElement.scrollTop}`);
            // Auto scroll up
            ladderDiagramPanelHTMLElement.scrollTop -= 20;
          }
        }
    });
  }
}
