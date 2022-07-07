import { TestBed } from '@angular/core/testing';

import { NewsStandService } from './news-stand.service';

describe('NewsStandService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NewsStandService = TestBed.get(NewsStandService);
    expect(service).toBeTruthy();
  });
});
