
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
      transformers: [{
        name: "TestTransformer"
      }]
    });

    expect(metadataService.metadata.getValue().transformers.toArray()).toBeArrayOfSize(1);
  })
});
