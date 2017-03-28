
import {AbstractMetadataService} from "./AbstractMetadataService";
import {inject, TestBed} from "@angular/core/testing";
import {StaticMetadataService} from "./StaticMetadataService";
import {Metadata} from "../classes/Metadata";
describe('MetadataServiceComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AbstractMetadataService, useClass: StaticMetadataService}
      ],
    });
  });

  it('should create an instance', inject([AbstractMetadataService], (metadataService: AbstractMetadataService) => {
    expect(metadataService.getMeta()).toEqual(jasmine.any(Metadata));
  }));

});
