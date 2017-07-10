import {AbstractDataService} from "./AbstractDataService";
import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class DataService extends AbstractDataService {

  readonly modified = new BehaviorSubject<boolean>(false);

  constructor() {
    super();
    this.hierarchy.switchMap(hierarchy => hierarchy.asObservable()).subscribe(() => {
      this.setModified(true);
    });
  }

  setModified(modifiedValue: boolean) {
    this.modified.next(modifiedValue);
  }

  isModified(): Observable<boolean> {
    return this.modified;
  }
}
