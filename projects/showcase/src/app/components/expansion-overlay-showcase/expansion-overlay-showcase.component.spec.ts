import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpansionOverlayShowcaseComponent } from './expansion-overlay-showcase.component';

describe('ExpansionOverlayShowcaseComponent', () => {
  let component: ExpansionOverlayShowcaseComponent;
  let fixture: ComponentFixture<ExpansionOverlayShowcaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpansionOverlayShowcaseComponent]
    });
    fixture = TestBed.createComponent(ExpansionOverlayShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
