import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldAdministrationComponent } from './field-administration.component';

describe('FieldAdministrationComponent', () => {
  let component: FieldAdministrationComponent;
  let fixture: ComponentFixture<FieldAdministrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldAdministrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
