import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {User} from "../../shared/user";
import {PaymentMethod} from "../../shared/payment-method";
import {Pointer} from "../../shared/pointer";
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from "@angular/forms";
import { NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {
  StripeService,
} from "ngx-stripe";

import {
  StripeElementsOptions as ElementsOptions,
  Token,
  StripeElements as Elements
} from '@stripe/stripe-js';
import {STRIPE_PUB_KEY} from "../../shared/global";
import {AuthenticationService} from "../authentication.service";
import {Router} from "@angular/router";
import {PayoutService} from "../payout/payout.service";
import {StripeSource} from "../../shared/stripe-source";
import {StripeCustomer} from "../../shared/stripe-customer";
import {Observable} from "rxjs";
import {Countries} from "../../shared/countries";
import * as uuid from 'uuid';
import {ObjectRef} from "../../shared/object-ref";
import {StripeSubscription} from "../../shared/stripe-subscription";
import {Order} from "../../shared/order";
import {SubscriptionService} from "../../subscription/subscription.service";
import {AccountService} from "../account.service";
import {Error} from "../../shared/error";

@Component({
  selector: 'app-signup-payment',
  templateUrl: './signup-payment.component.html',
  styleUrls: ['./signup-payment.component.scss'],
  providers:[PayoutService, AuthenticationService, AccountService]
})
export class SignupPaymentComponent implements OnInit, AfterViewInit  {
  @ViewChild('cardInfo', {}) cardInfo: ElementRef;
  public user: User;
  public subscriptionRef: ObjectRef;
  public paymentRef: ObjectRef;
  public trialPeriodHelp: String = "You have 3 days free before your credit card will be charged for the subscription.";
  public defaultSource: any;
  private userPointer: Pointer;
  public billingForm: FormGroup;
  public countries = Countries;
  private modalRef: NgbModalRef;
  public success: boolean;
  public hasSubmitted:boolean;
  public couponValid:boolean = true;
  public isInternational:boolean;
  public invalid:any[] = [];
  private failureMessage: string;

  elements: Elements;
  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;

  elementsOptions: ElementsOptions = {
    locale: 'en'
  };

  constructor(private fb: FormBuilder,
              @Inject(STRIPE_PUB_KEY)  key: string,
              private cd: ChangeDetectorRef,
              private accountService: AccountService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private subscriptionService: SubscriptionService,
              private paymentService: PayoutService,
              private stripeService: StripeService) {

  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    this.stripeService.elements(this.elementsOptions)
      .subscribe(elements => {
        this.elements = elements;
        // Only mount the element the first time
        if (!this.card) {
          this.card = this.elements.create('card', {
            style: {
              base: {
                iconColor: '#666EE8',
                color: '#31325F',
                lineHeight: '40px',
                fontWeight: 300,
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: '18px',
                '::placeholder': {
                  color: '#CFD7E0'
                }
              }
            }
          });
          this.card.mount('#card-element');
          this.card.addEventListener('change', this.cardHandler);
        }
      });
  }

  ngOnInit() {
    this.paymentRef = this.authenticationService.getPaymentRef();
    this.subscriptionRef = this.subscriptionService.getSubscriptionRef();
    this.user = this.authenticationService.getAuthenticatedUser();

    if(!this.user) {
      this.router.navigateByUrl('plans');
    }
    if(this.paymentRef) {
      this.router.navigateByUrl('signin');
    }
    this.createBillingForm();
  }

  createBillingForm() {
    this.billingForm = this.fb.group({
      cardHolder: new FormControl('', Validators.required),
      coupon:new FormControl('', null),
      phone:new FormControl('', Validators.required),
      street1: new FormControl('', Validators.required),
      street2: new FormControl('', null),
      city: new FormControl('', null),
      state: new FormControl('', null),
      zip: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required)
    });
  }

  public cancel() {}
  save() {
    this.hasSubmitted = true;
    this.success = false;
      const cardHolder:string = this.billingForm.get('cardHolder').value;
      const phone: string  =  this.billingForm.get('phone').value;
      const coupon: string = this.billingForm.get('coupon').value;
      const street1 = this.billingForm.get('street1').value;
      const street2 = this.billingForm.get('street2').value;
      const city = this.billingForm.get('city').value;
      const state = this.billingForm.get('state').value;
      const zip = this.billingForm.get('zip').value;
      const country = this.billingForm.get('country').value;

      this.stripeService.createToken(this.card,
        {
          name: cardHolder,
          address_line1: street1,
          address_line2: street2,
          address_city: city,
          address_state: state,
          address_zip: zip,
          address_country: country
        }).subscribe(token => {
        if(token.error){
          this.success = false;
          this.hasSubmitted = false;
          this.error = token.error.message;
          return;
        }
        const localToken = token.token as Token;
        if(!localToken){
          this.success = false;
          this.hasSubmitted = false;
          this.validateAllFormFields(this.billingForm);
          return;
        }

        //save source
        this.stripeService.createSource(this.card, {
          type: localToken.type,
          token: localToken.id,
          owner: {
            name:  cardHolder.trim(),
            email: this.user.email,
            phone: phone,
            address: {
              line1: localToken.card.address_line1,
              line2: localToken.card.address_line2,
              city: localToken.card.address_city,
              state: localToken.card.address_state,
              country: country,
              postal_code: localToken.card.address_zip
            }
          }
        }).subscribe(source => {
          if(!this.billingForm.invalid) {
            const localSource: StripeSource = source.source;
            this.createOrRetrieveCustomer(null, localSource.id).subscribe(customerRes => {
              if(!customerRes["code"]) {
                const customer: StripeCustomer = customerRes as StripeCustomer;
                this.user.customerId = customer.id;
                this.user.phone = phone;
                this.user.isActive = true;
                this.user.address = {
                  line1: localToken.card.address_line1,
                  line2: localToken.card.address_line2,
                  city: localToken.card.address_city,
                  state: localToken.card.address_state,
                  country_code: country,
                  postal_code: localToken.card.address_zip,
                  phone: phone
                }
                this.authenticationService.userSignUp(this.user).subscribe(
                  signUpRes => {
                    this.userPointer = {
                      objectId: (signUpRes as ObjectRef).objectId,
                      className: '_User',
                      __type: 'Pointer'
                    }
                    this.hasSubmitted = true;
                    if ((signUpRes as Error).code) {
                      this.success = false;
                      this.failureMessage = (signUpRes as Error).error;
                    } else {
                      this.paymentService.storeStripePayment({
                        isDefault: true,
                        customerId: customer.id,
                        metaData: customer,
                        cardInfo: token.token.card.brand + ':' + token.token.client_ip,
                        owner: this.userPointer,
                        title: token.token.card.brand,
                        isDebit: (token.token.card.funding.toLowerCase() === 'debit'),
                        isActive: (source.source.status.toLowerCase() === 'chargeable'),
                        description: token.token.card.last4,
                        type: 'stripe-' + token.token.type
                      }).subscribe(paymentRes => {
                        this.defaultSource = source.source;
                        console.log(this.defaultSource)
                        if (this.modalRef) this.modalRef.close();
                        console.log(paymentRes);
                        this.authenticationService.savePaymentRef(paymentRes);
                      }, err => {
                        this.hasSubmitted = false;
                        this.success = false;
                        console.log(err);
                      });


                      let subscription: StripeSubscription = {
                        customer: customer.id,
                        trial_period_days:3,
                        "metadata[user_id]": this.user.objectId,
                        "items[0][plan]": this.subscriptionRef['planId']
                      }
                      // set coupon if available
                      if (coupon && coupon.trim().length > 0) {
                        subscription.coupon = coupon;
                      }

                      this.paymentService.createStripeSubscription(subscription).subscribe(res => {
                        if (!res.error) {
                          const subscriptionRef = this.subscriptionService.getSubscriptionRef();
                          const order: Order = {
                            type: 'subscription',
                            license: uuid.v4(),
                            data: res,
                            isActive: true,
                            autoRecharge: false,
                            customerId: customer.id,
                            createdBy: this.userPointer,
                            subscription: {
                              objectId: subscriptionRef.objectId,
                              className: 'Subscription',
                              __type: 'Pointer'
                            }
                          };


                          this.paymentService.storeOrder(order).subscribe(res => {
                            sessionStorage.setItem('token', JSON.stringify(localToken));
                            this.router.navigateByUrl('signup/confirm');

                          }, err => {
                            this.hasSubmitted = false;
                            this.success = false;

                            console.error(err);
                          });

                        } else {
                          this.couponValid = res.error.param !== "coupon";
                          console.error(res.error, this.couponValid);
                          this.error = res.error.message;
                          this.hasSubmitted = false;
                          this.failureMessage = res.error.message;
                          this.success = false;

                        }
                      }, err => {
                        console.error(err);
                        this.hasSubmitted = false;
                        this.success = false;
                      });


                    }
                  }, err => {
                    console.log(err);
                  }
                );
              }else{
                this.hasSubmitted = false;
                this.success = false;
                console.log(customerRes);
              }
            })
          } else{
            this.validateAllFormFields(this.billingForm);
            this.hasSubmitted = false;
            this.success = false;
          }
        });

      }, err => {
        this.hasSubmitted = false;
        this.success = false;
        console.error(err);
      });


  }



  countryChanged() {
    const country = this.billingForm.get('country').value;
    this.isInternational = country.toUpperCase() !== "US";
  }

  isFieldValid(field: string) {
    return !this.billingForm.get(field).valid && this.billingForm.get(field).touched;
  }

  displayFieldCss(field: string) {
    return {
      'is-invalid': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }

  createOrRetrieveCustomer(customerId?: string, sourceId?: string) :Observable<StripeCustomer>{
    if(customerId == null ) {
      const fullName: string[] = [];
      fullName.push(this.user.firstName);
      fullName.push(this.user.lastName);
      console.log(1, customerId, sourceId);
      return this.paymentService.createStripeCustomer({
        source: sourceId,
        email: this.user.email,
        phone: this.user.phone,
        description:
          this.user.fullName ? this.user.fullName : fullName.join(' ')
      });
    } else {
      console.log(2, customerId)
      return this.paymentService.getStripeCustomer(customerId);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

}
