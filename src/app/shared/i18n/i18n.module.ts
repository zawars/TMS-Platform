import { NgModule } from "@angular/core";

import { LanguageSelectorComponent } from "./language-selector/language-selector.component";
import { I18nPipe } from "./i18n.pipe";
import { I18nService } from "./i18n.service";
import { CommonModule } from "@angular/common";
// import { BsDropdownModule } from "ngx-bootstrap";

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    LanguageSelectorComponent,
    I18nPipe
  ],
  exports: [LanguageSelectorComponent, I18nPipe],
  providers: [I18nPipe]

})
export class I18nModule { }
