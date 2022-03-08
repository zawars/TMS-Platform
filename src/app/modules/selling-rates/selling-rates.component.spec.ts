import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellingRatesComponent } from './selling-rates.component';

describe('SellingRatesComponent', () => {
  let component: SellingRatesComponent;
  let fixture: ComponentFixture<SellingRatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellingRatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellingRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
