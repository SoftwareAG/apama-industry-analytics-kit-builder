
import {TestBed} from "@angular/core/testing";
import {MetadataService} from "./MetadataService";

describe('MetadataService', () => {
  let metadataService: MetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MetadataService
      ]
    });
    metadataService = TestBed.get(MetadataService) as MetadataService;
  });

  it('should correctly parse a valid metadata json object', () => {
    metadataService.loadMetadata({
      version: "0.0.0.0",
      groupOrder: [],
      analytics: [{
        name: "TestTransformer",
        description: "TestTransformer Description",
        group: "",
        documentation: "TestTransformer Documentation"
      }]
    });
    expect(metadataService.metadata.getValue().analytics.toArray()).toBeArrayOfSize(1);
  });
});
