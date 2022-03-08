import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAreaComponent } from './create-area.component';

describe('CreateAreaComponent', () => {
  let component: CreateAreaComponent;
  let fixture: ComponentFixture<CreateAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
