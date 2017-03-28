
import {AbstractMetadataService} from "./AbstractMetadataService";
import {inject, TestBed} from "@angular/core/testing";
import {Metadata} from "../classes/Metadata";
import {AsyncMetadataServiceMock} from "./AsyncMetadataServiceMock";
describe('AsyncMetadataServiceMock', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: AbstractMetadataService, useClass: AsyncMetadataServiceMock}]
    });
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });


  it('should get a static metadata instance', inject([AbstractMetadataService], (metadataService: AbstractMetadataService) => {
    expect(metadataService.getMeta()).toEqual(jasmine.any(Metadata));
  }));

  it('should correctly call withMeta callback', inject([AbstractMetadataService], (metadataService: AbstractMetadataService) => {
    const withMetaCallback = jasmine.createSpy("withMetaCallBack");
    metadataService.withMeta(withMetaCallback);
    expect(withMetaCallback).not.toHaveBeenCalled();
    jasmine.clock().tick(0);
    expect(withMetaCallback).toHaveBeenCalledWith(jasmine.any(Metadata));
    jasmine.clock().tick(10000);
    expect(withMetaCallback).toHaveBeenCalledTimes(2);
    expect(withMetaCallback.calls.mostRecent().args[0]).toEqual(jasmine.any(Metadata));
  }));

});
