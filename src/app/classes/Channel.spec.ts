
import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {RowChannel, ChannelBuilder} from "./Channel";
describe('RowChannel', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
   new AsObservableTest().test(new ChannelBuilder().build(), done).then(done);
  })
});
