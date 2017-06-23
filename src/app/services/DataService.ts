import {RowChannel, RowChannelBuilder} from "../classes/Channel";
import {AbstractDataService} from "./AbstractDataService";
import {Injectable} from "@angular/core";
import {List} from "immutable";
import {Transformer} from "../classes/Transformer";
import {TransformerChannel} from "../classes/TransformerChannel";
import {Row} from "../classes/Row";
import {Data} from "@angular/router";

@Injectable()
export class DataService extends AbstractDataService {

  modified: boolean = false;

  constructor() {
    super();
    this.hierarchy.switchMap(hierarchy => hierarchy.asObservable()).subscribe(() => {
      this.setModified(true);
    });

    this.hierarchy.subscribe( () => {
      setTimeout( () => {
        this.setModified(false);
      });
    })
  }

  setModified(modifiedValue: boolean) {
    this.modified = modifiedValue;
  }

  isModified(): boolean {
    return this.modified === true;
  }
}
