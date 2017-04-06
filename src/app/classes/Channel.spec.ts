
import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {Channel, ChannelBuilder} from "./Channel";
describe('Channel', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
   new AsObservableTest().test(new ChannelBuilder().build(), done).then(done);
  })
});
