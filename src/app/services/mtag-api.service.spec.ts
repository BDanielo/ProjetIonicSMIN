import { TestBed } from '@angular/core/testing';

import { MTAGAPIService } from './mtag-api.service';

describe('MTAGAPIService', () => {
  let service: MTAGAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MTAGAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
