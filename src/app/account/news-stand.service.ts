import {Inject, Injectable} from '@angular/core';
import {ObjectRef} from "../shared/object-ref";
import {Observable, of} from "rxjs";
import {DataResponse} from "../shared/data-response";
import {Error} from "../shared/error";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Order} from "../shared/order";
import {PS_ROOT} from "../shared/global";

@Injectable({
  providedIn: 'root'
})
export class NewsStandService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient, @Inject(PS_ROOT) apiRoot: string) {
    this.apiUrl = apiRoot;
  }

  getOrders(withUserRef?: ObjectRef): Observable<Order | ObjectRef | DataResponse | Error> {
    let params: HttpParams = new HttpParams();
    params = params.set('searchQuery',
      JSON.stringify( {objectId:  withUserRef.objectId}));
    params = params.set('urlSlug', '/orders');
    params = params.set('parameters', '?order=updatedAt');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        return response;
      })
    );
  }

}
