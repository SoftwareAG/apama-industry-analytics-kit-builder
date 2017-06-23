import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationComponent } from './information.component';
import {AbstractDataService} from "../../services/AbstractDataService";
import {DataService} from "../../services/DataService";
import {AbstractMetadataService, MetadataService} from "../../services/MetadataService";
import {SelectionService} from "../../services/SelectionService";

describe('InformationComponent', () => {
  let component: InformationComponent;
  let fixture: ComponentFixture<InformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformationComponent ],
      providers:  [
        SelectionService,
        {provide: AbstractMetadataService, useClass: MetadataService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
