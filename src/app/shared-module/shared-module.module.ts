import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropDownScheduleComponent } from '../drop-down-schedule/drop-down-schedule.component';
import { GlobalDropDownComponent } from '../global-drop-down/global-drop-down.component';

@NgModule({
  declarations: [DropDownScheduleComponent, GlobalDropDownComponent],
  imports: [
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  exports: [DropDownScheduleComponent, GlobalDropDownComponent]
})
export class SharedModuleModule { }
