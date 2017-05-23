
import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {ConfigBuilder} from "./Config";
describe('Config', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new ConfigBuilder().build(), done).then(done);
  });
});

