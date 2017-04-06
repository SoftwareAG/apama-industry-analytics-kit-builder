
import {BehaviorSubject, Observable} from "rxjs";
import {List} from "immutable";

export type BehaviorSubjectify<T> = {
  readonly [P in keyof T]: BehaviorSubject<T[P]> | BehaviorSubject<List<any>>
}

export interface AsObservable {
  asObservable(): Observable<this>
}
