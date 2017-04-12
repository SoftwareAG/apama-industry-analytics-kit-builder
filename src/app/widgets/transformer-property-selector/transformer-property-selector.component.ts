import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {AbstractDataService} from "../../services/AbstractDataService";
import {Property} from "app/classes/Property";
import {List} from "immutable";

@Component({
  selector: 'transformer-property-selector',
  templateUrl: './transformer-property-selector.component.html',
  styleUrls: ['./transformer-property-selector.component.css']
})
export class TransformerPropertySelectorComponent implements OnInit {

  readonly transformerProperties: Observable<List<Property>>;

  constructor(dataService: AbstractDataService) {
    this.transformerProperties = dataService.selectedTransformer
      .switchMap(transformer => transformer ? transformer.asObservable() : Observable.of(undefined))
      .switchMap(transformer => transformer ? transformer.properties : Observable.of(List<Property>()));
  }

  ngOnInit() { }
}
