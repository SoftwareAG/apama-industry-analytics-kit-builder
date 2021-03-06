import {AsObservable, BehaviorSubjectify} from "./interfaces";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import * as Promise from "bluebird";
import {List} from "immutable";
import {Utils} from "../Utils";

class TestAsObservable implements AsObservable {
  constructor(private readonly subject: Subject<TestAsObservable>) {}

  asObservable(): Observable<this> {
    return Utils.hotObservable(this.subject.asObservable()) as Observable<this>;
  }
}

export class AsObservableTest<ClassToTest extends AsObservable & BehaviorSubjectify<any>> {
  test(classInstance: ClassToTest, done: DoneFn): Promise.Thenable<any> {
    const behaviorSubjectProps = Object.keys(classInstance).filter((key: string) => classInstance[key] instanceof BehaviorSubject);

    const observable = classInstance.asObservable();

    return Promise.mapSeries(behaviorSubjectProps, prop => {
      const currentValue = classInstance[prop] as BehaviorSubject<any>;
      if (Array.isArray(currentValue)) {
        done.fail(`Property: "${prop}" should be a BehaviorSubject<List<T>> not a BehaviorSubject<T[]>`);
      }
      const promise = observable.first().toPromise().then(() => {
        if (List.isList(currentValue.getValue())) {
          const testObservableSubject = new Subject<TestAsObservable>();
          const test = new TestAsObservable(testObservableSubject);
          currentValue.next(List([test]));
          const promise = observable.first().toPromise();
          testObservableSubject.next(new TestAsObservable(new Subject<TestAsObservable>()));
          return promise;
        }
        return null;
      });
      currentValue.next(currentValue.getValue());
      return promise;
    });
  }
}
