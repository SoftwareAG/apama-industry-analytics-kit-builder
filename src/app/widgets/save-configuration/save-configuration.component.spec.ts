import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SaveConfigurationComponent } from './save-configuration.component';
import {FormsModule} from "@angular/forms";
import {AbstractDataService} from "../../services/AbstractDataService";
import {DataService} from "../../services/DataService";
import {FileService} from "../../services/FileService";
import {ConfigSerializer} from "../../classes/Config";
import {RowSerializer} from "../../classes/Row";
import {TransformerSerializer} from "../../classes/Transformer";
import {PropertySerializer} from "../../classes/Property";
import {AbstractMetadataService, MetadataService} from "../../services/MetadataService";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

describe('SaveConfigurationComponent', () => {
  let component: SaveConfigurationComponent;
  let fixture: ComponentFixture<SaveConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SaveConfigurationComponent
      ],
        imports: [
          FormsModule,
      ],
      providers: [
        {provide: AbstractDataService, useClass: DataService},
        {provide: AbstractMetadataService, useClass: MetadataService},
        FileService,
        ConfigSerializer,
        RowSerializer,
        TransformerSerializer,
        PropertySerializer,
        NgbActiveModal
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
