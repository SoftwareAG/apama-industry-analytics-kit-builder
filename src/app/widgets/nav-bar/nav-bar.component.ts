import {Component} from "@angular/core";
import {ConfigBuilder, ConfigJsonInterface} from "../../classes/Config";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Observable} from "rxjs";
import {List, Set} from "immutable";
import {FileService, UserCancelled} from "../../services/FileService";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AbstractMetadataService} from "../../services/MetadataService";
import {SaveConfigurationComponent} from "app/widgets/save-configuration/save-configuration.component";
import {ModalDismissReasons, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NewConfigurationDialogComponent} from "../new-configuration-dialog/new-configuration-dialog.component";
import {SelectionService} from "../../services/SelectionService";
import {TransformerDefJsonInterface} from "../../classes/TransformerDef";
import {HistoryService} from "../../services/HistoryService";

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  readonly configurations: Observable<List<ConfigJsonInterface>>;
  readonly metadataVersions: BehaviorSubject<Set<string>>;
  readonly currentMetaVersion: Observable<string>;
  isNavbarCollapsed: boolean = true;

  constructor(public dataService: AbstractDataService, private fileService: FileService, private readonly metadataService: AbstractMetadataService,
              public modalService: NgbModal, private selectionService: SelectionService, private historyService: HistoryService) {
    this.metadataVersions = new BehaviorSubject(Set.of("2.0.0.0"));
    this.currentMetaVersion = metadataService.metadata.map(metadata => metadata.version);
    this.currentMetaVersion.subscribe(version => this.metadataVersions.next(this.metadataVersions.getValue().add(version)));
    this.configurations = metadataService.metadata.map(metadata => metadata.samples.map((sample:string) => fileService.deserializeConfig(sample).toJson()));
  }

  onConfigurationClick(config: ConfigJsonInterface) {
    this.dataService.hierarchy.next(ConfigBuilder.fromJson(config).build());
  }

  clearConfiguration() {
    const config = new ConfigBuilder()
      .build();
    this.dataService.hierarchy.next(config);
    this.dataService.setModified(false);
    this.selectionService.selection.next(undefined);
    this.historyService.reset();
  }

  newConfig() {
    this.dataService.isModified().first().subscribe(modified => {
      if (modified) {
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
    })
  }

  loadDataFile() {
    this.fileService.getFileData(".evt")
      .then(result => result.fileContent)
      .then(apamaEPL => this.fileService.deserializeConfig(apamaEPL))
      .then(config => {
        this.dataService.hierarchy.next(config);
        this.dataService.setModified(false);
        this.historyService.reset();
      })
      .catch(error => {
        if (error instanceof UserCancelled) {

        } else {
          alert(error);
        }
      });
  }

  loadConfig() {
    this.dataService.isModified().first().subscribe(modified => {
      if (modified) {
        this.modalService.open(NewConfigurationDialogComponent, {size: "lg"}).result
          .then(result => {
            if (result === "Yes") {
              this.loadDataFile();
            }
          }, () => {
          })
      } else {
        this.loadDataFile();
      }
    });
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

  loadAnalytics() {
    this.fileService.getAnalyticDefinitions(".mon")
      .map((fileAnalytic: {file: File, analyticDefinition: TransformerDefJsonInterface}) => fileAnalytic.analyticDefinition)
      .then(analytics => this.metadataService.loadAnalytic(...analytics))
  }

  importMetadata() {
    this.fileService.getFileData(".json")
      .then(result => result.fileContent)
      .then(jsonStr => JSON.parse(jsonStr))
      .then(json => {
        this.metadataService.loadMetadata(json);
      })
  }

  exportMetadata() {
    const metadata = this.metadataService.metadata.getValue();
    const content = this.fileService.serializeMetadata(metadata);
    const fileName = `metadata-${metadata.version}.json`;
    try {
      this.fileService.saveFile(fileName, JSON.stringify(content, null, 4));
    } catch(error) {
      alert(error.message);
    }
  }

  isSelectedVersion(version) {
    return this.metadataService.metadata.getValue().version === version;
  }
}
