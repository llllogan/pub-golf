import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallScoresComponent } from './overall-scores.component';

describe('OverallScoresComponent', () => {
  let component: OverallScoresComponent;
  let fixture: ComponentFixture<OverallScoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallScoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverallScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
