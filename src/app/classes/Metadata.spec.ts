
import {MetadataBuilder} from "./Metadata";
describe('Metadata', () => {

  it('should store the version data', () => {
    const metadata = new MetadataBuilder()
      .Version('1.2.3.4')
      .build();
    expect(metadata.version).toEqual('1.2.3.4')
  });

  it('should store the groupOrder data', () => {
    const metadata = new MetadataBuilder()
      .GroupOrder([
        'Detectors',
        'FlowManipulators',
        'Retail',
        'Manufacturing'
      ])
      .build();
    expect(metadata.groupOrder.count()).toEqual(4)
  });

  it('should append to existing groupOrder data', () => {
    const metadata = new MetadataBuilder()
      .GroupOrder([
        'Retail',
        'Manufacturing'
      ])
      .pushGroupOrder('Detectors', 'Flow Manipulators')
      .build();
    expect(metadata.groupOrder.count()).toEqual(4)
  });

});
