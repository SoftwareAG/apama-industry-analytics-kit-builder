import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {TransformerBuilder} from "./Transformer";
describe('Transformer', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new TransformerBuilder().build(), done).then(done);
  })
});
