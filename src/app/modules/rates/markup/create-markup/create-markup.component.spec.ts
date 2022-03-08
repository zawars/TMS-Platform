import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMarkupComponent } from './create-markup.component';

describe('CreateMarkupComponent', () => {
  let component: CreateMarkupComponent;
  let fixture: ComponentFixture<CreateMarkupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMarkupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMarkupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
