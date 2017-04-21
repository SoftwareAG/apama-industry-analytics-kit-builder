import {Component, OnInit} from "@angular/core";
import {Config} from "../../classes/Config";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Observable} from "rxjs";
import {Set, List} from "immutable";
import {FileService} from "../../services/FileService";
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
    let loadFile = document.createElement("INPUT") as HTMLInputElement;
    loadFile.type = "file";
    loadFile.accept = "text/*.evt";
    loadFile.click();
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
    new Promise<File>((resolve, reject) => {
      let loadFile = document.createElement("INPUT") as HTMLInputElement;
      loadFile.type = "file";
      loadFile.accept = "text/*.json";
      loadFile.onerror = reject;
      loadFile.onabort = reject;
      loadFile.onchange = () => {
        if (loadFile.files && loadFile.files[0]) {
          resolve(loadFile.files[0]);
        } else {
          reject();
        }
      };
      loadFile.click();
    })
      .then(file => {
        return new Promise<string>((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = function () {
            fileReader.result;
            resolve(fileReader.result);
          };
          fileReader.onerror = reject;
          fileReader.onabort = reject;
          fileReader.readAsText(file);
          setTimeout(() => {
            reject(new Error("Timed out while reading metadata file"));
            fileReader.abort();
          }, 2000);
        })
      })
      .then(jsonStr => JSON.parse(jsonStr))
      .then(json => this.metadataService.loadMetadata(json));
  }

  isSelectedVersion(version) {
    return this.metadataService.metadata.getValue().version === version;
  }
}
