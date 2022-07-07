import {Inject, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {DataResponse} from "../shared/data-response";
import {Error} from "../shared/error";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map} from "rxjs/operators";
import {PS_ROOT} from "../shared/global";
import {ObjectRef} from "../shared/object-ref";

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly apiUrl: string;
  constructor(private http: HttpClient, @Inject(PS_ROOT) apiRoot: string) {
    this.apiUrl = apiRoot;
  }

  getSubscriptionByPLanId(planId: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('searchQuery',
      JSON.stringify( {planId:planId}));
    params = params.set('urlSlug', '/classes/Subscription');
    params = params.set('parameters', '?order=updatedAt');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        this.saveSubscriptionRef(response.results[0]);
        return response;
      })
    );
  }

  saveSubscriptionRef(subscriptionRef: any):void{
    sessionStorage.setItem('X-subscription-ref', JSON.stringify(subscriptionRef));
}

  getSubscriptionRef() : ObjectRef {
    return JSON.parse(sessionStorage.getItem('X-subscription-ref'));
  }
}
