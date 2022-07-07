import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {PS_ROOT, QUOTES_API, WEBHOSE_API} from "../shared/global";
import {ObjectRef} from "../shared/object-ref";
import {Observable} from "rxjs";
import { of } from 'rxjs';
import {Order} from "../shared/order";
import {DataResponse} from "../shared/data-response";
import {Error} from "../shared/error";
import {map} from "rxjs/operators";
import {User} from "../shared/user";
import {Paper} from "../shared/paper";
import {Pointer} from "../shared/pointer";
import {Download} from "../shared/download";
import {DataLoad} from "../shared/data-load";

@Injectable({
  providedIn: 'root'
})
export class PaperService {
  private readonly apiUrl: string;
  private readonly webHoseApiUrl: string;
  private readonly quoteApiUrl: string;
  constructor(private http: HttpClient,
              @Inject(PS_ROOT) apiRoot: string,
              @Inject(WEBHOSE_API) webHoseApiRoot: string,
              @Inject(QUOTES_API) quoteApiRoot: string) {
    this.apiUrl = apiRoot;
    this.webHoseApiUrl = webHoseApiRoot;
    this.quoteApiUrl = quoteApiRoot;
  }

  getOrdersByLicense(license: string): Observable<Order | ObjectRef | DataResponse | Error> {
    let params: HttpParams = new HttpParams();
    params = params.set('searchQuery',
      JSON.stringify( {license:  license}));
    params = params.set('urlSlug', '/classes/Order/');
    params = params.set('parameters', '?include=paper,&order=updatedAt');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        return response;
      })
    );
  }

  getOrdersByOwner(owner: Pointer, type?:string): Observable<Order | ObjectRef | DataResponse | Error> {
    let params: HttpParams = new HttpParams();
    let queryObject: any = {createdBy:  owner};
    if(type){
      queryObject.type = type;
    }
    params = params.set('searchQuery',
      JSON.stringify( queryObject));
    params = params.set('urlSlug', '/classes/Order');
    params = params.set('parameters', '?include=subscription,&order=updatedAt');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        return response;
      })
    );
  }

  getDownloadCount(subscription?: Pointer, user?: Pointer) : Observable<any>{
    let data: any = {};
    let params: HttpParams = new HttpParams();
    if(subscription){
      data.subscription = subscription;
    }
    if(user){
      data.createdBy = user;
    }
    params = params.set('searchQuery', JSON.stringify(data));
    params = params.set('urlSlug', '/classes/Download');
    params = params.set('parameters', '?count=1');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        return response;
      })
    );
  }

  getPapersCount(user: Pointer) : Observable<any>{
    let data: any = {};
    let params: HttpParams = new HttpParams();
    data.createdBy = user;
    params = params.set('searchQuery', JSON.stringify(data));
    params = params.set('urlSlug', '/classes/Paper');
    params = params.set('parameters', '?count=1');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        return response;
      })
    );
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

  getDataLoadCount(subscription?: Pointer, user?: Pointer) : Observable<any>{
    let data:any = {};
    let params: HttpParams = new HttpParams();
    if(subscription){
      data.subscription = subscription;
    }
    if(user){
      data.createdBy = user;
    }
    params = params.set('searchQuery', JSON.stringify(data));
    params = params.set('urlSlug', '/classes/DataLoad');
    params = params.set('parameters', '?count=1');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        return response;
      })
    );
  }

  savePaper(withPaper: Paper): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', '/classes/Paper/' );
    params = params.set('data',JSON.stringify(withPaper));
    const options = { headers: headers};
    return this.http.post<any>(this.apiUrl, params, options).pipe(
      map((response: any) => {
          return response;
        }
      ));
  }

  public updatePaper(withPaper: Paper): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    if(withPaper.updatedAt)delete(withPaper.updatedAt);
    if(withPaper.createdAt)delete(withPaper.createdAt);
    let data: any = {
      urlSlug: '/classes/Paper/' + withPaper.objectId,
      data: withPaper
    }
    const options = { headers: headers};
    return this.http.put<any>(this.apiUrl, JSON.stringify(data), options);
  }

  downloadPaper(url: string, user: User): Observable<any>{
    let params: HttpParams = new HttpParams();
    params = params.set('url',url);
    params = params.set('token',user.sessionToken);
    return this.http.get('https://epaperweekly-gw.herokuapp.com/paper.php', { params:params,responseType: 'blob' });
  }

  addDownload(download: Download){
    let headers: HttpHeaders = new HttpHeaders();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', '/classes/Download/');
    params = params.set('data', JSON.stringify(download));
    const options = { headers: headers};
    return this.http.post<any>(this.apiUrl, params, options);
  }

  addDataLoad(dataLoad: DataLoad){
    let headers: HttpHeaders = new HttpHeaders();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', '/classes/DataLoad/');
    params = params.set('data', JSON.stringify(dataLoad));
    const options = { headers: headers};
    return this.http.post<any>(this.apiUrl, params, options);
  }

  gePaperData(paper:Paper, isTest:boolean, fromDate: Date, size: number) : Observable<any> {
    if(paper.type.toLowerCase() === "web") {
      return of<any[]>([]);
    }

    let params: HttpParams = new HttpParams();

    let categories: string[] = [];
    let languages: string[] = [];
    let networks: string[] = [];
    let keywords: string[] = [];
    let websites: string[] = [];
    let people: string[] = [];
    let organizations: string[] = [];

    let networksString: string;
    let websitesString: string;
    let categoryString: string;

    for (let cat of paper.interests) {
      categories.push("site_category:"+cat.code);
    }
    for (let cat of paper.preferredLanguage) {
      languages.push("language:"+cat.name);
    }
    for (let keys of paper.keywords) {
      keywords.push(keys.display);
    }
    if(paper.type.toLowerCase() === "research") {
      for (let web of paper.websites) {
        websites.push(web.display);
      }
      for (let person of paper.people) {
        people.push("\""+person.display+"\"");
      }
      for (let org of paper.organizations) {
        organizations.push("\""+org.display+"\"");
      }
    } else if (paper.type.toLowerCase() === "news") {
      for (let net of paper.networks) {
        networks.push("site:"+net.code);
      }
    }

    networksString = networks.length > 0 ? " (" +networks.join(" OR ")+") " :"";
    websitesString = websites.length > 0 ? " (" +websites.join(" OR ")+") " :"";
    categoryString = categories.length > 0 ?  " ("+categories.join(" OR ")+") " : "";

    params = params.set('ts',''+fromDate.getTime());
    params = params.set('size',''+size);
    params = params.set('parameters', categoryString+languages.join(" OR ")
      + ((keywords.length > 1) ? ' text:('+keywords.join(" OR ")+')' : ((keywords.length == 1) ?' text:'+keywords.join("") : ""))
      + ((people.length > 1) ? ' person:('+people.join(" OR ")+')' : ((people.length == 1) ?' person:'+people.join("") : ""))
      + ((organizations.length > 1) ? ' organization:('+organizations.join(" OR ")+')' : ((organizations.length == 1) ?' organization:'+organizations.join("") : ""))
      + ((paper.type.toLowerCase() === "news") ? networksString : websitesString)
      + ((paper.countries) ? " thread.country:"+paper.countries["code"]+" " : "")
      + " has_video:false domain_rank:<1000 "
      +(paper.type.toLowerCase() === "news" ? "site_type:news" : "(site_type:news OR site_type:blogs OR site_type:discussions)")
    );

    console.log(paper,params)

    const options = { withCredentials: false, params:params};
    return this.http.get<any>(isTest ? "http://localhost:4200/assets/data/news.json" : this.webHoseApiUrl, options).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  getQuoteData(paramData:any, isTest:boolean) : Observable<any>{
    let params: HttpParams = new HttpParams();
    params = params.set('parameters', 'category=inspire');
    const options = { withCredentials: false, params:params};
    return this.http.get<any>(isTest ? "http://localhost:4200/assets/data/news.json" : this.quoteApiUrl, options).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  public removePaper(paper: Paper) {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug','/classes/Paper/Delete/' + paper.objectId);
    const options = { headers: headers, params: params};
    return this.http.get<any>(this.apiUrl, options);
  }

  getPaper(id: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('searchQuery',
      JSON.stringify( {objectId:  id}));
    params = params.set('urlSlug', '/classes/Paper');
    params = params.set('parameters', '?order=updatedAt');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        return response;
      })
    );
  }

  getPapers(withUser: ObjectRef | User): Observable<Order | ObjectRef | DataResponse | Error> {
    const userPointer = {
      objectId: withUser.objectId,
      className: '_User',
      __type: 'Pointer'
    }
    let params: HttpParams = new HttpParams();
    params = params.set('searchQuery',
      JSON.stringify( {createdBy:  userPointer}));
    params = params.set('urlSlug', '/classes/Paper');
    params = params.set('parameters', '?order=updatedAt');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        return response;
      })
    );
  }
}
