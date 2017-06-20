import {Component, OnInit} from "@angular/core";
import {Config, ConfigBuilder} from "../../classes/Config";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Observable} from "rxjs";
import {List, Set} from "immutable";
import {FileService, UserCancelled} from "../../services/FileService";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AbstractMetadataService} from "../../services/MetadataService";
import {SaveConfigurationComponent} from "app/widgets/save-configuration/save-configuration.component";
import {ModalDismissReasons, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {RowChannel} from "../../classes/Channel";
import {NewConfigurationDialogComponent} from "../new-configuration-dialog/new-configuration-dialog.component";

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  readonly configurations: Observable<List<() => Config>>;
  readonly dataService: AbstractDataService;
  readonly metadataVersions: BehaviorSubject<Set<string>>;
  readonly currentMetaVersion: Observable<string>;
  isNavbarCollapsed: boolean = true;

  constructor(dataService: AbstractDataService, private fileService: FileService, private readonly metadataService: AbstractMetadataService, public modalService: NgbModal) {
    this.dataService = dataService;
    this.configurations = this.dataService.configurations.asObservable();
    this.metadataVersions = new BehaviorSubject(Set.of("2.0.0.0"));
    this.currentMetaVersion = metadataService.metadata.map(metadata => metadata.version);
    this.currentMetaVersion.subscribe(version => this.metadataVersions.next(this.metadataVersions.getValue().add(version)));
  }

  ngOnInit() {
  }

  onConfigurationClick(config: () => Config) {
    this.dataService.hierarchy.next(config());
  }

  clearConfiguration() {
    const config = new ConfigBuilder()
      .build();
    this.dataService.hierarchy.next(config);
    this.dataService.selectedTransformer.next(undefined);
    this.dataService.channels.next(List<RowChannel>());
  }

  newConfig() {
    if (this.dataService.isModified()) {
      this.modalService.open(NewConfigurationDialogComponent, {size: "lg"}).result
        .then(result => {
          if (result === "Yes") {
           this.clearConfiguration();
          }
        }, () => {
        })
    } else {
      this.clearConfiguration();
    }
  }

  loadDataFile() {
    this.fileService.getFileData(".evt")
      .then(result => result.fileContent)
      .then(apamaEPL => this.fileService.deserialize(apamaEPL))
      .then(config => {
        this.dataService.hierarchy.next(config);
      })
      .catch(error => {
        if (error instanceof UserCancelled) {

        } else {
          alert(error);
        }
      });
  }

  loadConfig() {
    if (this.dataService.isModified()) {
      this.modalService.open(NewConfigurationDialogComponent, {size: "lg"}).result
        .then(result => {
          if (result === "Yes") {
            this.loadDataFile();
          };
        }, () => {
        })
    } else {
      this.loadDataFile();
    }
  }

  openSaveConfigurationDialog() {
    let closeResult: string;
    this.modalService.open(SaveConfigurationComponent, {size: "lg"})
      .result.then((result) => {
      closeResult = `Closed with: ${result}`;
    }, (reason) => {
      closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  metadataVersionChange(value) {
  }

  loadCustomMetadata() {
    this.fileService.getFileData(".json")
      .then(result => result.fileContent)
      .then(jsonStr => JSON.parse(jsonStr))
      .then(json => this.metadataService.loadMetadata(json))
      .then(() => this.dataService.channels.next(List<RowChannel>()));
  }

  isSelectedVersion(version) {
    return this.metadataService.metadata.getValue().version === version;
  }
}
