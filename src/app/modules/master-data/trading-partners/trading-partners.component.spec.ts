import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradingPartnersComponent } from './trading-partners.component';

describe('TradingPartnersComponent', () => {
  let component: TradingPartnersComponent;
  let fixture: ComponentFixture<TradingPartnersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TradingPartnersComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradingPartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
