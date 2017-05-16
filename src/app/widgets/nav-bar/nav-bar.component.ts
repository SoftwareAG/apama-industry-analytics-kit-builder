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

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  readonly configurations: Observable<List<Config>>;
  readonly dataService: AbstractDataService;
  readonly metadataVersions: BehaviorSubject<Set<string>>;
  readonly currentMetaVersion: Observable<string>;
  isNavbarCollapsed: boolean = true;

  constructor(dataService: AbstractDataService, private fileService: FileService, private readonly metadataService: AbstractMetadataService, public modalService: NgbModal) {
    this.dataService = dataService;
    this.configurations = this.dataService.configurations.asObservable();
    this.metadataVersions = new BehaviorSubject(Set.of("1.0.0", "1.1.0", "1.1.1", "1.2.x-BETA"));
    this.currentMetaVersion = metadataService.metadata.map(metadata => metadata.version);
    this.currentMetaVersion.subscribe(version => this.metadataVersions.next(this.metadataVersions.getValue().add(version)));
  }

  ngOnInit() {
  }

  onConfigurationClick(config: Config) {
    this.dataService.hierarchy.next(config);
  }

  newConfig() {
    const config = new ConfigBuilder()
      .Name('New Configuration')
      .withRow().endWith()
      .build();
    this.dataService.hierarchy.next(config);
  }

  loadConfig() {
    this.fileService.getFileData(".evt")
      .then(result => result.fileContent)
      .then(apamaEPL => this.fileService.deserialize(apamaEPL))
      .then(config => {
        this.dataService.hierarchy.next(config)
      })
      .catch(error => {
        if (error instanceof UserCancelled) {

        } else {
          alert(error);
        }
      })
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
      .then(json => this.metadataService.loadMetadata(json));
  }

  isSelectedVersion(version) {
    return this.metadataService.metadata.getValue().version === version;
  }
}
