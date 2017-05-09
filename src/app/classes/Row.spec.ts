import {AsObservableTest} from "../interfaces/AsObservable.spec";
import {RowBuilder} from "./Row";
import {MetadataBuilder} from "./Metadata";
describe('Row', () => {

  it('should trigger asObservable.next() when any BehaviorSubject property is updated', (done) => {
    new AsObservableTest().test(new RowBuilder().build(), done).then(done);
  });

  describe('should correctly get the input/output channels', ()=> {
    const metadata = new MetadataBuilder()
      .withAnalytic()
        .Name("Analytic1")
        .withInputChannel().Name("InputChannel0").endWith()
        .withInputChannel().Name("InputChannel1").endWith()
        .withInputChannel().Name("InputChannel2").endWith()
        .withInputChannel().Name("InputChannel3").endWith()
        .withOutputChannel().Name("OutputChannel0").endWith()
        .withOutputChannel().Name("OutputChannel1").endWith()
        .withOutputChannel().Name("OutputChannel2").endWith()
        .withOutputChannel().Name("OutputChannel3").endWith()
        .endWith()
      .build();
    for(let i = 0; i<4; i++) {
      it(`Overridden Channel: ${i}`, () => {
        const row = new RowBuilder()
          .pushTransformer(metadata.createAnalytic("Analytic1"))
          .withInputChannel(i).Name("OverriddenInput").endWith()
          .withOutputChannel(i).Name("OverriddenOutput").endWith()
          .build();

        const expectedInResults = [
          "InputChannel0",
          "InputChannel1",
          "InputChannel2",
          "InputChannel3",
        ];
        expectedInResults[i] = "OverriddenInput";

        const expectedOutResults = [
          "OutputChannel0",
          "OutputChannel1",
          "OutputChannel2",
          "OutputChannel3",
        ];
        expectedOutResults[i] = "OverriddenOutput";

        expect(row.getInChannels(metadata).toArray().map(chan => chan.toJson().name)).toEqual(expectedInResults);
        expect(row.getOutChannels(metadata).toArray().map(chan => chan.toJson().name)).toEqual(expectedOutResults);
      })
    }
  })
});
