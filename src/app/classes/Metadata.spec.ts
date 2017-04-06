import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {MetadataBuilder} from "./Metadata";
describe('Metadata', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new MetadataBuilder().build(), done).then(done);
  })
});
