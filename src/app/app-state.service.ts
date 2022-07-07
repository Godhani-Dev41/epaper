import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {PS_ROOT} from "./shared/global";
import {ObjectRef} from "./shared/object-ref";
import {Observable} from "rxjs";
import {Order} from "./shared/order";
import {DataResponse} from "./shared/data-response";
import {Error} from "./shared/error";
import {map} from "rxjs/operators";

@Injectable()
export class AppStateService {
  private readonly apiUrl: string;
  private isOnLoginPage: boolean = false;

  setIsOnLoginPage(isOnLoginPage: boolean) {
    this.isOnLoginPage = isOnLoginPage;
  }

  getIsOnLoginPage(): boolean {
    return this.isOnLoginPage;
  }
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

