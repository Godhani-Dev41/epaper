import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {STRIPE_PUB_KEY} from "../../shared/global";
import {AuthenticationService} from "../authentication.service";
import {Router} from "@angular/router";
import {PayoutService} from "../payout/payout.service";
import {StripeService} from "ngx-stripe";
import {User} from "../../shared/user";

@Component({
  selector: 'app-signup-confirm',
  templateUrl: './signup-confirm.component.html',
  styleUrls: ['./signup-confirm.component.scss'],
  providers:[PayoutService, AuthenticationService]
})
export class SignupConfirmComponent implements OnInit {
  public user: User;
  constructor(private fb: FormBuilder,
              @Inject(STRIPE_PUB_KEY)  key: string,
              private authenticationService: AuthenticationService,
              private router: Router,
              private paymentService: PayoutService,
              private stripeService: StripeService) {
  }

  ngOnInit() {
    this.user = this.authenticationService.getAuthenticatedUser();
    if(!sessionStorage.getItem("verifySent")) {
      this.authenticationService.verify(this.user).subscribe(res => {
        sessionStorage.setItem("verifySent", "1");
        console.log(res);
      }, err => {
        console.log(err)
      });
    }
  }

  verify() {
    this.authenticationService.verify(this.user).subscribe(res => {
      console.log(res);
    }, err => {
      console.log(err)
    });
  }
}
