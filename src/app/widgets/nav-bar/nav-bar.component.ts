import {Component, OnInit} from "@angular/core";
import {Config} from "../../classes/Config";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Observable} from "rxjs";
import {List} from "immutable";

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  readonly configurations: Observable<List<Config>>;
  dataService: AbstractDataService;

  constructor(dataService: AbstractDataService) {
    this.dataService = dataService;
    this.configurations = this.dataService.configurations.asObservable();
  }

  ngOnInit() {
  }

  onConfigurationClick(config: Config) {
    this.dataService.hierarchy.next(config);



  }

}
