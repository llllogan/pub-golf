import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';

import { ScorecardComponent } from './app/components/scorecard/scorecard.component';
import { OverallScoresComponent } from './app/components/overall-scores/overall-scores.component';

const routes: Routes = [
  { path: '', redirectTo: 'scorecard', pathMatch: 'full' },
  { path: 'scorecard', component: ScorecardComponent },
  { path: 'overall-scores', component: OverallScoresComponent },
];

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
