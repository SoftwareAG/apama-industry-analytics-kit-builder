import {Component, OnInit} from "@angular/core";
import {Config} from "../../classes/Config";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Observable} from "rxjs";
import {Set, List} from "immutable";
import {FileService, UserCancelled} from "../../services/FileService";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AbstractMetadataService} from "../../services/MetadataService";

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  readonly configurations: Observable<List<Config>>;
  readonly dataService: AbstractDataService;
  readonly metadataVersions: BehaviorSubject<Set<string>>;
  readonly currentMetaVersion: Observable<string>;
  isNavbarCollapsed: boolean = true;

  constructor(dataService: AbstractDataService, private fileService: FileService, private readonly metadataService: AbstractMetadataService) {
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
          throw error;
        }
      })
  }

  saveConfig() {
    let saveFile = document.createElement("a");
    const config = this.dataService.hierarchy.getValue();
    const data = this.fileService.serialize(config);
    saveFile.href = "data:application/octet-stream," + encodeURI(data);
    saveFile.download = config.name.getValue() + ".evt";
    saveFile.click();
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
