import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupPaymentComponent } from './signup-payment.component';

describe('SignupPaymentComponent', () => {
  let component: SignupPaymentComponent;
  let fixture: ComponentFixture<SignupPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
