import { TestBed, inject } from '@angular/core/testing';

import { PayoutService } from './payout.service';

describe('PayoutService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PayoutService]
    });
  });

  it('should be created', inject([PayoutService], (service: PayoutService) => {
    expect(service).toBeTruthy();
  }));
});
