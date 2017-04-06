import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {TransformerDefBuilder} from "./TransformerDef";
describe('TransformerDef', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new TransformerDefBuilder().build(), done).then(done);
  })
});
