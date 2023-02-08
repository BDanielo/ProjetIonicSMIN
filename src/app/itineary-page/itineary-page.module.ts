import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItinearyPagePageRoutingModule } from './itineary-page-routing.module';

import { ItinearyPagePage } from './itineary-page.page';
import { SharedModuleModule } from '../shared-module/shared-module.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItinearyPagePageRoutingModule,
    SharedModuleModule
  ],
  declarations: [ItinearyPagePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ItinearyPagePageModule {}
