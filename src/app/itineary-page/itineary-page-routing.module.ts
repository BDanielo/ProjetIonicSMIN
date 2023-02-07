import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItinearyPagePage } from './itineary-page.page';

const routes: Routes = [
  {
    path: '',
    component: ItinearyPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItinearyPagePageRoutingModule {}
