import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {DataResponse} from '../../shared/data-response';
import {Error} from '../../shared/error';
import {map} from 'rxjs/operators';
import {StripeCard} from '../../shared/stripe-card';
import {PAYPAL_API, PAYPAL_TOKEN_API, PS_ROOT, STRIPE_API} from '../../shared/global';
import {StripeCustomer} from '../../shared/stripe-customer';
import {Pointer} from '../../shared/pointer';
import {PaymentMethod} from '../../shared/payment-method';
import {ObjectRef} from '../../shared/object-ref';
import {PayoutMethod} from '../../shared/payout-method';
import {PayPalToken} from '../../shared/pay-pal-token';
import {Order} from "../../shared/order";
import {StripePlan} from "../../shared/stripe-plan";
import {StripeProduct} from "../../shared/stripe-product";
import {StripeSubscription} from "../../shared/stripe-subscription";
import {StripeOrder} from "../../shared/stripe-order";
import {StripePayment} from "../../shared/stripe-payment";

@Injectable()
export class PayoutService {
  private readonly apiUrl: string;
  private readonly payPalApi: string;
  private readonly payPalTokenApi: string;
  private readonly stripeApi: string;
  constructor(private http: HttpClient,
              @Inject(PS_ROOT) apiRoot: string,
              @Inject(PAYPAL_TOKEN_API) payPalTokenApi: string,
              @Inject(PAYPAL_API) payPalApi: string,
              @Inject(STRIPE_API) stripeApi: string) {
    this.apiUrl = apiRoot;
    this.payPalApi = payPalApi;
    this.payPalTokenApi = payPalTokenApi;
    this.stripeApi = stripeApi;
  }

  private convertJsonToPostData(obj: any): string {
    let str = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
        console.log(key + " -> " + obj[key]);
      }
    }
    return str.join("&");
  }

  storePayPalPayment(withCardInfo: StripeCard): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  withCardInfo ? '/users' : '/classes/Organization/');
    params = params.set('data', JSON.stringify(withCardInfo));
    return this.http.post<DataResponse | Error>(this.payPalApi,params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  createStripeCustomer(withCustomer: StripeCustomer): Observable<StripeCustomer> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/customers');
    params = params.set('contentType','application/x-www-form-urlencoded');
    params = params.set('data', this.convertJsonToPostData(withCustomer));
    return this.http.post<DataResponse | Error>(this.stripeApi, params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  updateStripeCustomer(withCustomer: StripeCustomer, id: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/customers/'+id);
    params = params.set('contentType','application/x-www-form-urlencoded');
    params = params.set('data', this.convertJsonToPostData(withCustomer));
    return this.http.post<any>(this.stripeApi, params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  createStripeOrder(withStripeOrder: StripeOrder): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/orders');
    params = params.set('contentType','application/x-www-form-urlencoded');
    params = params.set('data', this.convertJsonToPostData(withStripeOrder));
    return this.http.post<DataResponse | Error>(this.stripeApi, params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  createPaymentForStripeOrder(withStripeOrder: StripeOrder, orderId: string): Observable<any> {
    let payment: StripePayment = {
      customer: withStripeOrder.customer,
      "metadata[order_id]": withStripeOrder["metadata[order_id]"],
      "metadata[user_id]": withStripeOrder["metadata[user_id]"]
    }
    console.log('createPaymentForStripeOrder', payment);

    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/orders/'+orderId+"/pay");
    params = params.set('contentType','application/x-www-form-urlencoded');
    params = params.set('data', this.convertJsonToPostData(payment));
    return this.http.post<DataResponse | Error>(this.stripeApi, params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }


  createStripeSubscription(withSubscription: StripeSubscription): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/subscriptions');
    params = params.set('contentType','application/x-www-form-urlencoded');
    params = params.set('data', this.convertJsonToPostData(withSubscription));
    return this.http.post<DataResponse | Error>(this.stripeApi, params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  updateStripeSubscription(withSubscription: StripeSubscription, id: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/subscriptions/'+id);
    params = params.set('contentType','application/x-www-form-urlencoded');
    params = params.set('data', this.convertJsonToPostData(withSubscription));
    return this.http.post<any>(this.stripeApi, params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  cancelStripeSubscription(id: string, reason: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/subscriptions/'+id);
    params = params.set('id',  id);
    params = params.set('reason',  reason);
    params = params.set('contentType','application/x-www-form-urlencoded');
    const options = { withCredentials: true, body: params};
    return this.http.delete<any>(this.stripeApi, options).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  getStripeSubscription(id: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/subscriptions/'+id);
    params = params.set('contentType','application/x-www-form-urlencoded');
    const options = { withCredentials: true, params: params};
    return this.http.get<StripeSubscription>(this.stripeApi, options).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  createStripePlan(withPlan: StripePlan): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/plans');
    params = params.set('contentType','application/x-www-form-urlencoded');
    params = params.set('data', this.convertJsonToPostData(withPlan));
    return this.http.post<DataResponse | Error>(this.stripeApi, params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  createStripeProduct(withProduct: StripeProduct): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/products');
    params = params.set('contentType','application/x-www-form-urlencoded');
    params = params.set('data', this.convertJsonToPostData(withProduct));
    return this.http.post<DataResponse | Error>(this.stripeApi, params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }


  createPayPalCustomer(withCustomer: StripeCustomer): Observable<StripeCustomer> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/customers');
    params = params.set('contentType','application/x-www-form-urlencoded');
    params = params.set('data', this.convertJsonToPostData(withCustomer));
    return this.http.post<DataResponse | Error>(this.stripeApi, params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  getPayPalToken(): Observable<PayPalToken> {
    let params: HttpParams = new HttpParams();
    params = params.set('grant_type',  'grant_type=client_credentials');
    return this.http.post<DataResponse | Error>(this.payPalTokenApi, params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  getStripeCustomer(withCustomerId: string): Observable<StripeCustomer> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', '/customers/'+ withCustomerId);
    const options = { withCredentials: true, params: params};
    return this.http.get<StripeCustomer>(this.stripeApi, options);
  }

  storeStripePayment(withPaymentMethod: PaymentMethod): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/classes/PaymentMethod/');
    params = params.set('data', JSON.stringify(withPaymentMethod));
    return this.http.post<DataResponse | Error>(this.apiUrl,params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  storeOrder(withOrder: Order): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/classes/Order/');
    params = params.set('data', JSON.stringify(withOrder));
    return this.http.post<DataResponse | Error>(this.apiUrl,params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  updateOrder(withOrder: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    if(withOrder.updatedAt)delete(withOrder.updatedAt);
    if(withOrder.createdAt)delete(withOrder.createdAt);

    let data: any = {
      urlSlug: '/classes/Order/' + withOrder.objectId,
      data: withOrder
    }

    const options = { headers: headers};
    return this.http.put<any>(this.apiUrl, JSON.stringify(data), options).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }


  storePayPalPayout(withPayoutMethod: PayoutMethod): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/classes/PayoutMethod/');
    params = params.set('data', JSON.stringify(withPayoutMethod));
    return this.http.post<DataResponse | Error>(this.apiUrl,params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  storeStripePayout(withPayoutMethod: PayoutMethod): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/classes/PayoutMethod/');
    params = params.set('data', JSON.stringify(withPayoutMethod));
    return this.http.post<DataResponse | Error>(this.apiUrl,params).pipe(
      map((response:any) => {
          return response;
        }
      ));
  }

  public performBatch(withRequests: any[]) {
    let headers: HttpHeaders = new HttpHeaders();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', '/batch');
    params = params.set('data', JSON.stringify(withRequests));
    const options = { headers: headers};
    return this.http.post<any>(this.apiUrl, params, options);
  }

  getPayoutMethod(withUserPointer: Pointer, withType?: string, defaultOnly?: boolean): Observable<DataResponse> {
    let params: HttpParams = new HttpParams();
    let query: any = {};
    if(defaultOnly) {
      query = {$and:[{isDefault:defaultOnly},{owner:withUserPointer}]};
      if(withType){
        query.$and.push({type: withType});
      }
    }else{
      if(withType){
        query = {$and:[{type:withType},{owner:withUserPointer}]}
      } else {
        query = {owner:withUserPointer};
      }

    }
    params = params.set('searchQuery', JSON.stringify( query));
    params = params.set('urlSlug', '/classes/PayoutMethod');
    params = params.set('parameters', '?order=-updatedAt');
    const options = { withCredentials: true, params: params};
    return this.http.get<DataResponse>(this.apiUrl, options);
  }

  getPayoutMethodById(withId: string): Observable<PayoutMethod> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', '/classes/PayoutMethod/'+withId);
    const options = { withCredentials: true, params: params};
    return this.http.get<PayoutMethod>(this.apiUrl, options);
  }

  getConfigParams(): Observable<DataResponse> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', '/config');
    const options = { withCredentials: true, params: params};
    return this.http.get<DataResponse>(this.apiUrl, options);
  }


  public updateActiveStateOfPayoutMethod(id: string, isActive: boolean, isDefault?: boolean): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    let data: any = {
      urlSlug: '/classes/PayoutMethod/' + id,
      data: {isActive: isActive}
    }
    if(isDefault) {
      data.data = {isDefault: isDefault,isActive: isActive};
    }
    const options = { headers: headers};
    return this.http.put<any>(this.apiUrl, JSON.stringify(data), options);
  }


  public updatePayoutMethod(withPayoutMethod: PayoutMethod): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    if(withPayoutMethod.updatedAt)delete(withPayoutMethod.updatedAt);
    if(withPayoutMethod.createdAt)delete(withPayoutMethod.createdAt);
    let data: any = {
      urlSlug: '/classes/PayoutMethod/' + withPayoutMethod.objectId,
      data: withPayoutMethod
    }
    const options = { headers: headers};
    return this.http.put<any>(this.apiUrl, JSON.stringify(data), options);
  }

  getPaymentMethod(withUserPointer: Pointer, defaultOnly?: boolean, debitOnly?: boolean): Observable<DataResponse> {
    let params: HttpParams = new HttpParams();
    let query: any = {};
    if(defaultOnly) {
      query = {$and:[{isDefault:defaultOnly},{owner:withUserPointer}]}
      if(debitOnly){
        query.$and.push({isDebit: debitOnly});
      }
    }else{
      if(debitOnly){
        query = {$and:[{isDebit:debitOnly},{owner:withUserPointer}]}
      }else{
        query = {owner:withUserPointer};
      }
    }
    params = params.set('searchQuery', JSON.stringify( query));
    params = params.set('urlSlug', '/classes/PaymentMethod');
    params = params.set('parameters', '?order=-updatedAt');
    const options = { withCredentials: true, params: params};
    return this.http.get<DataResponse>(this.apiUrl, options);
  }

}
