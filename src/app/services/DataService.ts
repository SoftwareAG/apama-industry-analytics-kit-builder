import {AbstractDataService} from "./AbstractDataService";
import {Injectable} from "@angular/core";

@Injectable()
export class DataService extends AbstractDataService {

  modified: boolean = false;

  constructor() {
    super();
    this.hierarchy.switchMap(hierarchy => hierarchy.asObservable()).subscribe(() => {
      this.setModified(true);
    });

    this.hierarchy.subscribe( () => {
      this.setModified(false);
    });

    this.modified = false;
  }

  setModified(modifiedValue: boolean) {
    this.modified = modifiedValue;
  }

  isModified(): boolean {
    return this.modified === true;
  }
}
