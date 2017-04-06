import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {PropertyDefBuilder} from "./PropertyDef";
describe('PropertyDef', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new PropertyDefBuilder().build(), done).then(done);
  })
});
