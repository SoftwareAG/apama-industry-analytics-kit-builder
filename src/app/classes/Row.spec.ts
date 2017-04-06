import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {PropertyDefBuilder} from "./PropertyDef";
import {RowBuilder} from "./Row";
describe('Row', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new RowBuilder().build(), done).then(done);
  })
});
