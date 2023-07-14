import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgxT3PaginatorModule } from '@traent/ngx-paginator';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    NgxT3PaginatorModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
