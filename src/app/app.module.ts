import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SidebarModule } from './shared/sidebar/sidebar.module';
import { HeaderModule } from './shared/header/header.module';
import { BreadCrumbsModule } from './shared/breadcrumbs/breadcrumbs.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { AppRoutes } from 'src/app/app.routing';
import { UtilityService } from 'src/app/services/utility.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { I18nService } from 'src/app/shared/i18n/i18n.service';
import { ModalModule } from 'ngx-bootstrap';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    AppComponent,
    AuthLayoutComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    BreadCrumbsModule,
    RouterModule.forRoot(AppRoutes, { useHash: true }),
    HttpClientModule,
    ModalModule.forRoot(),
    NgxSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [
    I18nService,
    UtilityService,
    ApiService,
    AuthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
