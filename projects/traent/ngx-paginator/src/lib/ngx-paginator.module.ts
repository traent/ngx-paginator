import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PaginatorListComponent } from './paginator-list/paginator-list.component';
import { RealtimeListComponent } from './realtime-list/realtime-list.component';

@NgModule({
  declarations: [
    PaginatorListComponent,
    RealtimeListComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    PaginatorListComponent,
    RealtimeListComponent,
  ],
})
export class NgxT3PaginatorModule { }
