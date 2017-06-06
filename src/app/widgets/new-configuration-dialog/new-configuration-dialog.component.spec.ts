import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {NewConfigurationDialogComponent} from "./new-configuration-dialog.component";
import {FormsModule} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

describe('NewConfigurationDialogComponent', () => {
  let component: NewConfigurationDialogComponent;
  let fixture: ComponentFixture<NewConfigurationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NewConfigurationDialogComponent
      ],
      imports: [
        FormsModule
      ],
      providers: [
        NgbActiveModal
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewConfigurationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
