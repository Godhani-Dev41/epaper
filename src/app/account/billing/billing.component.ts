import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {
  StripeService,
} from "ngx-stripe";

import {
  StripeCardElementOptions,
  StripeElementsOptions as ElementsOptions,
  Token,
  StripeElement,
  StripeElements as Elements
} from '@stripe/stripe-js';


import {STRIPE_PUB_KEY} from '../../shared/global';
import {StripeCard} from '../../shared/stripe-card';
import {User} from '../../shared/user';
import {Pointer} from '../../shared/pointer';
import {AuthenticationService} from '../authentication.service';
import {PayoutService} from '../payout/payout.service';
import {StripeSource} from '../../shared/stripe-source';
import {StripeCustomer} from '../../shared/stripe-customer';
import {PaymentMethod} from '../../shared/payment-method';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {Subscription} from "../../shared/subscription";
import {Order} from "../../shared/order";
import * as uuid from 'uuid';
import {PaperService} from "../../paper/paper.service";
import {StripeSubscription} from "../../shared/stripe-subscription";
import {SubscriptionService} from "../../subscription/subscription.service";
import {Countries} from "../../shared/countries";

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
  providers: [PayoutService]
})

export class BillingComponent implements OnInit {
  public user: User;
  public subscription: Subscription;
  public isLoading: boolean = false;
  public order: Order;
  public countries = Countries;
  public coupon: string;
  public defaultPaymentMethod: PaymentMethod;
  public success:boolean;
  public couponValid:boolean = true;
  public couponHasSaved:boolean;
  public isInternational:boolean;
  public selectedPlanName:string;
  public planUpdatedMessage:string = "Congratulations! Your subscription was changed successfully.";
  public couponMessage:string;
  public cardUpdatedMessage:string = "Your Billing info was changed successfully.";
  public postQueryHelp: string = 'Post queries happen when a paper is generated and is based on the topics, interests, related country and other information gathered at the time your paper is created.';
  public downloadLimitHelp: string = 'The maximum number of papers downloaded each month. When you download a paper it converts it to a PDF that has been formatted for your device.';
  public articlesPerPaperLimitHelp: string = 'The maximum number of articles that are embedded in your paper. This also includes one daily quote.';
  public paperTemplateHelp: string = 'Once you have created a paper, we store all of the settings you selected. This allows you to easily get the latest news based on your previous preferences without having to recreate it.';
  public defaultSource: any;
  private userPointer: Pointer;
  public billingForm: FormGroup;
  public couponForm: FormGroup;
  public cancelForm: FormGroup;
  private modalRef: NgbModalRef;
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
              private authenticationService: AuthenticationService,
              private router: Router,
              private paperService: PaperService,
              private subscriptionService: SubscriptionService,
              private paymentService: PayoutService,
              private stripeService: StripeService,
              private modalService: NgbModal) {
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  ngOnInit() {
    this.authenticationService.getUser(null, true).subscribe( res => {
      if(!res) {
        this.router.navigateByUrl('/signin');
        return false;
      }
      if(!this.authenticationService.user && (res as User).objectId){
        this.user = res as User;
      } else {
        this.user = this.authenticationService.user;
      }
      this.userPointer = {
        objectId: this.user.objectId,
        className: '_User',
        __type: 'Pointer'
      }

      this.paymentService.getPaymentMethod(this.userPointer,true).subscribe( res => {
        //console.log("getPaymentMethod: ", res)
        if(res.results && res.results.length > 0 ){
          this.defaultPaymentMethod = res.results[0];
          this.defaultSource = this.defaultPaymentMethod.metaData.sources.data[0];
          //console.log(this.defaultPaymentMethod);
        }
      }, err => {
        console.log(err);
      });

      this.getUsersOrderInfo(this.userPointer);
      this.createBillingForm();
      this.createCouponForm();
      this.createCancelForm();
    }, err => {
      console.log(err);
    });

  }

  getUsersOrderInfo(userPointer: Pointer) {
    this.isLoading = true;
    this.paperService.getOrdersByOwner(userPointer).subscribe( res => {
      //console.log("getUsersOrderInfo",res)
      if(res['results'] && res['results'].length > 0) {
        this.order = res['results'][0] as Order;
        this.subscription = this.order.subscription as Subscription;
        this.isLoading = false;
        this.coupon = sessionStorage.getItem("coupon");
      }
    }, err => {
      console.error(err);
    })

  }

  createPlan(planId: string, newPlan:string,subscriptionId:string) {
    this.selectedPlanName = newPlan;
    this.isLoading = true;
    let subscription: StripeSubscription = {
      customer: this.user.customerId,
      "metadata[user_id]": this.user.objectId,
      "items[0][plan]": planId
    }

    if (this.coupon) {
      subscription.coupon = this.coupon;
      this.couponMessage = "The coupon code <b> "+this.coupon+"</b> has been applied to your subscription."
    }

    this.paymentService.createStripeSubscription(subscription).subscribe(subRes => {
      if (!subRes.error) {
        const order: Order = {
          objectId: this.order.objectId,
          license: uuid.v4(),
          data: subRes,
          isActive: true,
          customerId: this.user.customerId,
          createdBy: this.userPointer,
          subscription: {
            objectId: subscriptionId,
            className: 'Subscription',
            __type: 'Pointer'
          }
        };
        this.paymentService.updateOrder(order).subscribe(res => {
          this.isLoading = false;
          this.success = true;
          this.subscription.name = subRes.metadata.plan;
          this.getUsersOrderInfo(this.userPointer);
        }, err => {
          console.error(err);
          this.isLoading = false;
        })
      } else {
        const errorCode = subRes.error.code;
        const errorParam = subRes.error.param;
        this.error = subRes.error.message;
        this.success = false;
        this.isLoading = false;
        if(errorCode === "resource_missing" &&  errorParam === "coupon"){
          this.couponValid = false;
        }
        console.error(subRes.error)
      }
    }, err => {
      console.error(err);
      this.isLoading = false;
      this.success = false;
    });
  }

  managePlan(planId: string, newPlan:string, subscriptionId: string) {
    this.error = undefined
    if(this.order.isActive){
      this.updatePlan(planId, newPlan, subscriptionId);
    }else{
      this.createPlan(planId, newPlan, subscriptionId);
    }
  }

  updatePlan(planId: string, newPlan:string, subscriptionId: string) {
    this.selectedPlanName = newPlan;
    this.isLoading = true;
    this.success = undefined;
    const subscription: StripeSubscription = {
      "metadata[order_id]" : this.order.objectId,
      "metadata[user_id]" : this.user.objectId,
      "items[0][id]":this.order.data.items.data[0].id,
      cancel_at_period_end: false,
      "metadata[plan]" : newPlan,
      proration_behavior: 'none',
      "items[0][plan]": planId
    }
    if (this.coupon) {
      subscription.coupon = this.coupon;
      this.couponMessage = "The coupon code <b>"+this.coupon+"</b> has been applied to your subscription."
    }
    this.paymentService.updateStripeSubscription(subscription, this.order.data.id).subscribe(subRes => {
      if(!subRes.error) {
        this.subscriptionService.getSubscriptionByPLanId(planId).subscribe(res => {
          const order: Order = {
            objectId: this.order.objectId,
            type: 'subscription',
            license: uuid.v4(),
            data: subRes,
            isActive:true,
            subscription: {
              objectId: res.results[0].objectId,
              className: 'Subscription',
              __type: 'Pointer'
            }
          }
          this.paymentService.updateOrder(order).subscribe(res => {
            this.isLoading = false;
            this.success = true;
            this.subscription.name = subRes.metadata.plan;

          }, err => {
            this.isLoading = false;
            console.error(err);
          })
        }, err => {
          this.isLoading = false;
          console.error(err);
        });
      }else{
        const errorCode = subRes.error.code;
        const errorParam = subRes.error.param;
        this.success = false;
        this.isLoading = false;
        this.error = subRes.error.message;
        if(errorCode === "resource_missing" &&  errorParam === "coupon"){
          this.couponValid = false;
        }
      }
    }, err => {
      console.error(err);
    })
  }

  createBillingForm(withCardInfo?: StripeCard) {
    if (withCardInfo) {
      this.billingForm = this.fb.group({
        cardHolder: new FormControl(withCardInfo.name, Validators.required),
        street1: new FormControl(withCardInfo.billing_address.line1, Validators.min(1)),
        street2: new FormControl(withCardInfo.billing_address.line1, null),
        city: new FormControl(withCardInfo.billing_address.city, null),
        state: new FormControl(withCardInfo.billing_address.state, null),
        zip: new FormControl(withCardInfo.billing_address.postal_code, Validators.min(1)),
        country: new FormControl('', Validators.required)
      });
    } else {
      this.billingForm = this.fb.group({
        cardHolder: new FormControl('', Validators.required),
        street1: new FormControl('', Validators.required),
        street2: new FormControl('', null),
        city: new FormControl('', null),
        state: new FormControl('', null),
        zip: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required)
      });
    }
  }

  createCouponForm() {
      this.couponForm = this.fb.group({
        coupon: new FormControl('', Validators.required)
      });
  }


  createCancelForm() {
    this.cancelForm = this.fb.group({
      cancelReason: new FormControl('', Validators.required)
    });
  }

  public cancel() {
    this.isLoading = true;
    this.success = undefined
    this.error = undefined
    if(this.cancelForm.valid) {
      let reason:string = this.cancelForm.get("cancelReason").value;
      this.paymentService.cancelStripeSubscription(this.order.data.id, reason).subscribe(res => {
        if (res["error"]){
          let error = res["error"] as any;
          let code = error["code"] as string
          this.error = code == "resource_missing" ? "Your subscription is canceled or does not exist.": error["message"];
          this.success = false;
          this.isLoading = false;
          this.order.isActive = false;
          console.error(this.error)
        }
        //update users account
        this.paymentService.updateOrder({
          objectId: this.order.objectId,
          isActive: false,
          customerNote: reason,
          data: res
        }).subscribe(orderRes => {
          if (!orderRes["error"]) {
            this.getUsersOrderInfo(this.userPointer);
            this.cleanUserData();
          } else {
            console.error(orderRes);
          }
          if (this.modalRef) this.modalRef.close();
          this.isLoading = false;
        }, err => {
          console.error(err);
        });
      }, err => {
        console.error(err)
      });
    }
  }

  confirmCancel(content){
    this.modalRef = this.modalService.open(content, {size: 'lg'});
  }

  addUpdateCardInfo(content) {
    this.error = undefined;
    this.modalRef = this.modalService.open(content, {size: 'lg'});
    this.stripeService.elements(this.elementsOptions)
      .subscribe(elements => {
        this.elements = elements;
          this.card = this.elements.create('card', {
            style: {
              base: {
                iconColor: '#666EE8',
                color: '#31325F',
                lineHeight: '38px',
                fontWeight: 300,
                '::placeholder': {
                  color: '#CFD7E0'
                }
              }
            }
          });
          this.card.mount('#card-element');
          this.card.addEventListener('change', this.cardHandler);
      });
  }

  updateCouponState(event){
    const control = this.couponForm.get("coupon");
    this.couponHasSaved = false;
    this.couponValid = control.valid
    this.coupon = control.value
  }

  saveCoupon() {
    this.isLoading = true;
    const _this = this;
    const control = this.couponForm.get("coupon");
    if(control.valid) {
      this.coupon = control.value;
      sessionStorage.setItem("coupon", _this.coupon);
      setTimeout(function () {
        _this.couponValid = true;
        _this.couponHasSaved = true;
        _this.isLoading = false;
      }, 1000);
    }else{
      this.isLoading = false;
      this.couponValid = false;
    }
  }
  save() {
    this.isLoading = true;
    const cardHolder = this.billingForm.get('cardHolder').value;
    const street1 = this.billingForm.get('street1').value;
    const street2 = this.billingForm.get('street2').value;
    const city = this.billingForm.get('city').value ? this.billingForm.get('city').value : '';
    const state = this.billingForm.get('state').value ? this.billingForm.get('state').value : '';
    const zip = this.billingForm.get('zip').value;
    const country = this.billingForm.get('country').value;

    this.stripeService.createToken(this.card,
      {
        name: cardHolder,
        address_line1:street1,
        address_line2:street2,
        address_city:city,
        address_state: state,
        address_country: country,
        address_zip:zip}).subscribe( token => {
          if(token.error){
            this.success = false;
            this.isLoading = false;
            this.error = token.error.message;
            return;
          }
          const localToken = token.token as Token;
          const fullName: string[] = [];
          fullName.push(this.user.firstName);
          fullName.push(this.user.lastName);
          sessionStorage.setItem('token',JSON.stringify(localToken));
          if(this.billingForm.valid) {
            //save source
            if(!localToken){
              this.success = false;
              this.isLoading = false;
              return;
            }
            this.stripeService.createSource(this.card, {
              type: localToken.type,
              token: localToken.id,
              metadata: {}, //this.userPointer,
              owner: {
                name:  cardHolder.trim(),
                email: this.user.email,
                phone: this.user.phone,
                address: {
                  line1: localToken.card.address_line1,
                  line2: localToken.card.address_line2,
                  city: localToken.card.address_city,
                  state: localToken.card.address_state,
                  country: localToken.card.address_country,
                  postal_code: localToken.card.address_zip
                }
              }
            }).subscribe(source => {
              const localSource: StripeSource = source.source;
              const customerId: string = this.user.customerId;
              this.createOrRetrieveCustomer(customerId, localSource.id).subscribe(res => {
                let customer: StripeCustomer = res as StripeCustomer;

                this.paymentService.updateStripeCustomer({
                  source: source.source.id
                }, customerId).subscribe(cRes => {
                  customer = cRes as StripeCustomer;
                  if (!cRes.error) {
                    this.paymentService.getPaymentMethod(this.userPointer).subscribe(res => {
                      let requests: any = {
                        requests: []
                      }
                      for (let payment of res.results) {
                        let body: any = {
                          method: 'DELETE',
                          path: '/parse/classes/PaymentMethod/' + payment.objectId
                        }
                        requests.requests.push(body);
                      };
                      this.paymentService.performBatch(requests).subscribe(
                        res => {
                          this.paymentService.storeStripePayment({
                            isDefault: true,
                            customerId: customerId,
                            metaData: customer,
                            cardInfo: token.token.card.brand + ':' + token.token.client_ip,
                            owner: this.userPointer,
                            title: token.token.card.brand,
                            isDebit: (token.token.card.funding.toLowerCase() === 'debit'),
                            isActive: (source.source.status.toLowerCase() === 'chargeable'),
                            description: token.token.card.last4,
                            type: 'stripe-' + token.token.type
                          }).subscribe(res => {
                            this.isLoading = false;
                            this.defaultSource = source.source;
                            if (this.modalRef) this.modalRef.close();
                          }, err => {
                            console.log(err);
                            this.isLoading = false;
                          })
                        }
                      );
                    }, err => {
                      console.error(err);
                      this.isLoading = false;
                    });
                  }
                  this.isLoading = false;
                }, err => {
                  this.isLoading = false;
                });
              });

            });
          }else{
            this.validateAllFormFields(this.billingForm);
            this.isLoading = false;
          }
    }, err => {
      console.error(err);
      this.isLoading = false;
    });

  }

  cleanUserData() {
    //delete data load
    this.paperService.getDataLoadCount(null, this.userPointer).subscribe(res =>{
      let requests: any = {
        requests: []
      }
      for(let dataLoad of res.results) {
        let body:any = {
          method: 'DELETE',
          path: '/parse/classes/DataLoad/' + dataLoad.objectId
        }
        requests.requests.push(body);
      };
      this.paperService.performBatch(requests).subscribe(res =>{
      }, err => {
        console.error(err);
      });
    }, err =>{
      console.error(err);
    });
    //delete downloads
    this.paperService.getDownloadCount( null, this.userPointer).subscribe(res =>{
      let requests: any = {
        requests: []
      }
      for(let download of res.results) {
        let body:any = {
          method: 'DELETE',
          path: '/parse/classes/Download/' + download.objectId
        }
        requests.requests.push(body);
      };
      this.paperService.performBatch(requests).subscribe(res =>{
      }, err => {
        console.error(err);
      });
    }, err =>{
      console.error(err);
    });

    //delete papers
    this.paperService.getPapersCount( this.userPointer).subscribe(res =>{
      let requests: any = {
        requests: []
      }
      for(let download of res.results) {
        let body:any = {
          method: 'DELETE',
          path: '/parse/classes/Paper/' + download.objectId
        }
        requests.requests.push(body);
      };
      this.paperService.performBatch(requests).subscribe(res =>{
      }, err => {
        console.error(err);
      });
    }, err =>{
      console.error(err);
    });
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
  countryChanged() {
    const country = this.billingForm.get('country').value;
    this.isInternational = country.toUpperCase() !== "US";
  }

  isFieldValid(field: string) {
    return !this.billingForm.get(field).valid && this.billingForm.get(field).touched;
  }

  isCancelFieldValid(field: string) {
    return !this.cancelForm.get(field).valid && this.cancelForm.get(field).touched;
  }

  displayFieldCss(field: string) {
    return {
      'is-invalid': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }

  displayCancelFieldCss(field: string) {
    return {
      'is-invalid': this.isCancelFieldValid(field),
      'has-feedback': this.isCancelFieldValid(field)
    };
  }
  createOrRetrieveCustomer(customerId?: string, sourceId?: string) :Observable<StripeCustomer>{
    const fullName: string[] = [];
    fullName.push(this.user.firstName);
    fullName.push(this.user.lastName);
    if(!customerId) {
      return this.paymentService.createStripeCustomer({
        source: sourceId,
        email: this.user.email,
        description:
          this.user.fullName ? this.user.fullName : fullName.join(' ') + ' (' + this.user.objectId + ')' + ' card info'
      });
    } else {
      return this.paymentService.getStripeCustomer(customerId);
    }
  }
}
