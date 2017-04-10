import { Component } from '@angular/core';
import {AbstractDataService} from "./services/AbstractDataService";
import {DataService} from "./services/DataService";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // title = 'app works!';

  constructor(dataService: AbstractDataService) {
    (dataService as DataService).loadConfigurations();
    (dataService as DataService).loadChannels();
    (dataService as DataService).loadTransformers();
  }
}
