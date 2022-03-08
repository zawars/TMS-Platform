import { TestBed } from '@angular/core/testing';

import { DropdownResolverService } from './dropdown-resolver.service';

describe('DropdownResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DropdownResolverService = TestBed.get(DropdownResolverService);
    expect(service).toBeTruthy();
  });
});
