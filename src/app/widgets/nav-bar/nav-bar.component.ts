import {Component, OnInit, ViewChild} from "@angular/core";
import {Config} from "../../classes/Config";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Observable} from "rxjs";
import {List} from "immutable";
import {FileService} from "../../services/FileService";

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  readonly configurations: Observable<List<Config>>;
  dataService: AbstractDataService;
  @ViewChild('saveFile') saveFile: any;

  constructor(dataService: AbstractDataService, private fileService: FileService) {
    this.dataService = dataService;
    this.configurations = this.dataService.configurations.asObservable();
  }

  ngOnInit() {
  }

  onConfigurationClick(config: Config) {
    this.dataService.hierarchy.next(config);
  }

  saveConfiguration() {
    let saveFile = this.saveFile.nativeElement;

    const config = this.dataService.hierarchy.getValue();

    const data = this.fileService.serialize(config);
    saveFile.href = "data:application/octet-stream," + encodeURI(data);
    saveFile.download = config.name.getValue() + ".evt";
    saveFile.click();
  }
}
