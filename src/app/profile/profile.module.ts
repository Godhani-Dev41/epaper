import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProfileComponent} from './profile.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxMaskModule} from 'ngx-mask';
import {AuthGuard} from "../account/auth-guard";

export const PROFILE_ROUTES: Routes = [
  { path: 'profile/id:', component: ProfileComponent,canActivate: [AuthGuard]},
  { path: 'profile', component: ProfileComponent,canActivate: [AuthGuard]}
];

@NgModule({
  imports: [
    NgbModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaskModule.forRoot(),
    RouterModule.forChild(PROFILE_ROUTES)
  ],
  declarations: [ProfileComponent]
})
export class ProfileModule { }
