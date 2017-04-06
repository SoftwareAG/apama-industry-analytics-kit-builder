import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {PropertyBuilder} from "./Property";
describe('Property', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new PropertyBuilder().build(), done).then(done);
  })
});
