import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {TransformerChannelDefBuilder} from "./TransformerChannelDef";
describe('TransformerChannelDef', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new TransformerChannelDefBuilder().build(), done).then(done);
  })
});
