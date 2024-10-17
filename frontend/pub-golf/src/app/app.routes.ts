import { Routes } from '@angular/router';

import { ScorecardComponent } from '.././app/components/scorecard/scorecard.component';
import { OverallScoresComponent } from '.././app/components/overall-scores/overall-scores.component';

export const routes: Routes = [
    { path: '', redirectTo: 'scorecard', pathMatch: 'full' },
    { path: 'scorecard', component: ScorecardComponent },
    { path: 'overall-scores', component: OverallScoresComponent },
];
