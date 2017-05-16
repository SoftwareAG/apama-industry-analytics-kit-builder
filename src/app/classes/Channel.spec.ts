
import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {RowChannel, RowChannelBuilder} from "./Channel";
describe('RowChannel', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
   new AsObservableTest().test(new RowChannelBuilder().build(), done).then(done);
  })
});
