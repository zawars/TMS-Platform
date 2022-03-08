import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTradingPartnersComponent } from './create-trading-partners.component';

describe('CreateTradingPartnersComponent', () => {
  let component: CreateTradingPartnersComponent;
  let fixture: ComponentFixture<CreateTradingPartnersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateTradingPartnersComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTradingPartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
