import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaperComponent } from './paper.component';
import {RouterModule, Routes} from "@angular/router";
import {NgxMasonryModule} from "ngx-masonry";
import {Nl2BrPipeModule} from "nl2br-pipe";

export const PAPER_ROUTES: Routes = [
  { path: 'paper/:license/:pid', component: PaperComponent}
];

@NgModule({
  declarations: [PaperComponent],
  imports: [
    CommonModule,
    NgxMasonryModule,
    Nl2BrPipeModule,
    RouterModule.forChild(PAPER_ROUTES)
  ]
})
export class PaperModule { }
