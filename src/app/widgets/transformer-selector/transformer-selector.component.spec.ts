import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {TransformerSelectorComponent} from "./transformer-selector.component";
import {AbstractMetadataService} from "../../services/AbstractMetadataService";
import {Injectable} from "@angular/core";
import {Metadata} from "../../classes/Metadata";

@Injectable()
class SynchronousMetadataServiceMock implements AbstractMetadataService {
  //noinspection JSMethodCanBeStatic
  getMeta() {
    return new Metadata({
      transformers: [{
        name: "MyFirstAnalytic",
        properties: []
      },{
        name: "MySecondAnalytic",
        properties: []
      }]
    });
  }

  withMeta(callback: (meta: Metadata) => void) {
    callback(this.getMeta());
  }
}

describe('TransformerSelectorComponent', () => {
  let component: TransformerSelectorComponent;
  let fixture: ComponentFixture<TransformerSelectorComponent>;
  let el: HTMLElement;
  let metadataService: AbstractMetadataService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransformerSelectorComponent ],
      providers: [
        {provide: AbstractMetadataService, useClass: SynchronousMetadataServiceMock}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransformerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
    metadataService = TestBed.get(AbstractMetadataService);
  });

  it('should have an svg child element', () => {
    expect(el.children[0].nodeName).toEqual('svg');
  });

  it('should create transformer elements', () => {
    expect(el.querySelectorAll('.transformer').length).toEqual(2);
    const metadata = metadataService.getMeta();
    Array.from(el.querySelectorAll('.transformer')).forEach((transformerEl, i) => {
      expect((transformerEl.querySelector('text') as Element).textContent).toEqual(metadata.transformers[i].name);
    });
  });
});
