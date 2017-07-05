import {Injectable} from "@angular/core";
import {Config, ConfigBuilder, ConfigJsonInterface} from "../classes/Config";
import {Stack} from "immutable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AbstractDataService} from "./AbstractDataService";
import {Observable} from "rxjs/Observable";

@Injectable()
export class HistoryService {
  private readonly undoStack;
  private readonly redoStack = new BehaviorSubject(Stack<ConfigJsonInterface>());

  constructor(private dataService: AbstractDataService) {
    this.undoStack = new BehaviorSubject(Stack.of(dataService.hierarchy.getValue().toJson()));

    this.dataService.hierarchy.switchMap(config => {
      return config.asObservable()
    })
      .debounceTime(500)
      .subscribe((config) => {
        this.undoStack.next(this.undoStack.getValue().push(config.toJson()));
      });
  }

  canRedo(): Observable<boolean> {
    return this.redoStack.map(list => list.size > 0);
  }

  canUndo(): Observable<boolean> {
    return this.undoStack.map(list => list.size > 1);
  }

  undo() {
    this.redoStack.next(this.redoStack.getValue().push(this.undoStack.getValue().first()));
    this.undoStack.next(this.undoStack.getValue().pop());
    const currentConfig = ConfigBuilder.fromJson(this.undoStack.getValue().first()).build();
    this.dataService.hierarchy.next(currentConfig);
  }

  redo() {
    const config: Config = ConfigBuilder.fromJson(this.redoStack.getValue().first()).build();
    this.undoStack.next(this.undoStack.getValue().push(this.redoStack.getValue().first()));
    this.redoStack.next(this.redoStack.getValue().pop());
    this.dataService.hierarchy.next(config);
  }

  reset() {
    this.undoStack.next(Stack.of(this.dataService.hierarchy.getValue().toJson()));
    this.redoStack.next(Stack<ConfigJsonInterface>());
  }
}
