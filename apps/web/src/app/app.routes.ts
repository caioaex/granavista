import { Routes } from '@angular/router';
import { HealthCheck } from './features/health-check/health-check';

export const routes: Routes = [
  {
    path: 'check',
    component: HealthCheck
  }
];
