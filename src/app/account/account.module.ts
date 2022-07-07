import {ChangeDetectorRef, NgModule} from '@angular/core';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './signup/signUp.component';
import { RouterModule, Routes } from '@angular/router';
import { BillingComponent } from './billing/billing.component';
import { AccountComponent } from './account.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import {AuthenticationService} from './authentication.service';
import {NgxStripeModule} from 'ngx-stripe';
import {NgxMaskModule} from 'ngx-mask';
import {AuthGuard} from "./auth-guard";
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { SignupPaymentComponent } from './signup/signup-payment.component';
import { OrderComponent } from './order/order.component';
import { SignupConfirmComponent } from './signup/signup-confirm.component';
import { VerifyComponent } from './signup/verify.component';
import {IonRangeSliderModule} from "ng2-ion-range-slider";
import {ClipboardModule} from "ngx-clipboard";
import { PasswordResetComponent } from './password-recovery/password-reset.component';
import {UiSwitchModule} from "ngx-ui-switch";
import { ContactComponent } from './contact.component';
import {environment} from '../../environments/environment';
import {TagInputModule} from "ngx-chips";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {CommonModule} from "@angular/common";
import { NgxSliderModule } from '@angular-slider/ngx-slider';

export const ACCOUNT_ROUTES: Routes = [
  { path: 'getstarted', component: SignUpComponent},
  { path: 'signup', component: SignUpComponent},
  { path: 'signup/personal', component: SignUpComponent},
  { path: 'signup/payment', component: SignupPaymentComponent},
  { path: 'signup/confirm', component: SignupConfirmComponent},
  { path: 'signin', component: LoginComponent},
  { path: 'forgot/password', component: PasswordRecoveryComponent},
  { path: 'forgot/password/reset', component: PasswordResetComponent},
  { path: 'forgot/password/login', component: PasswordResetComponent},
  { path: 'forgot/password/verify/:token', component: PasswordRecoveryComponent},
  { path: 'settings', component: BillingComponent,canActivate: [AuthGuard]},
  { path: 'account', component: AccountComponent,canActivate: [AuthGuard]},
  { path: 'papers', component: OrderComponent},
  { path: 'contact', component: ContactComponent},
  { path: 'verify/:token', component: VerifyComponent}
];

@NgModule({
  imports: [
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ClipboardModule,
    TagInputModule,
    SelectDropDownModule,
    UiSwitchModule,
    // IonRangeSliderModule,
    NgxMaskModule.forRoot(null),
    NgxStripeModule.forRoot(environment.stripePubKey),
    RouterModule.forChild(ACCOUNT_ROUTES),
    CommonModule,
    NgxSliderModule
  ],
  declarations: [LoginComponent, SignUpComponent, BillingComponent,OrderComponent,
    AccountComponent, PasswordRecoveryComponent, SignupPaymentComponent, SignupConfirmComponent, VerifyComponent, PasswordResetComponent, ContactComponent
  ], providers: [AuthenticationService],
  exports: [
    CommonModule,
    ClipboardModule,
    RouterModule
  ]
})
export class AccountModule { }
