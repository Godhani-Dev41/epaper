import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {PS_ROOT} from '../shared/global';
import {map} from 'rxjs/operators';
import {DataResponse} from '../shared/data-response';
import {User} from '../shared/user';
import {Observable, of} from 'rxjs';
import {Error} from '../shared/error';
import {ObjectRef} from '../shared/object-ref';
import {Pointer} from '../shared/pointer';
import {Paper} from "../shared/paper";

@Injectable()
export class AuthenticationService {
  private readonly apiUrl: string;
  public user: User;
  public userRef: ObjectRef;

  constructor(private http: HttpClient, @Inject(PS_ROOT) apiRoot: string) {
    this.apiUrl = apiRoot;
  }

  userSignIn(withUsername: string, withPassword: string): Observable<ObjectRef | Error| User> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug',  '/login?username=' + withUsername + '&password=' +withPassword);
    const options = { withCredentials: true, params:params};
    return this.http.get<ObjectRef | Error | User>(this.apiUrl, options).pipe(
      map((response: ObjectRef | Error | User) => {
        if(!response['error']) {
          this.user = response as User;
          this.saveUser(this.user);
        }
        return  response;
      })
    )
  }

  userSignInTemp(withUsername: string, withPassword: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('searchQuery',
      JSON.stringify( {username:withUsername, tempPassword:withPassword}));
    params = params.set('urlSlug', '/users');
    params = params.set('parameters', '?order=updatedAt');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        if (response.results.length > 0){
          this.user = response.results[0];
          this.saveUser(this.user);
        }
        return response;
      })
    );
  }

  userSignUp(withUser: User): Observable<ObjectRef | Error> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', '/users' );
    params = params.set('data',JSON.stringify(withUser));
    return this.http.post<DataResponse | Error>(this.apiUrl,params).pipe(
      map((response:any) => {
          console.log(response);
          if(withUser){
            delete(this.user);
            this.userRef = response as ObjectRef;
            this.userRef.authToken = withUser.authToken;
            if(!response.error) {
              this.saveUserRef(this.userRef);
            }
          }
          return response;
        }
      ));
  }

  setUserAuthToken(token: string, uid: string): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    let data: any = {
      urlSlug: '/users/' + uid,
      data: {authToken: token}
    }
    const options = { headers: headers};
    return this.http.put<any>(this.apiUrl, JSON.stringify(data), options);
  }

  setEmailVerified(isVerified: boolean, uid: string): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    let data: any = {
      urlSlug: '/users/' + uid,
      data: {emailVerified: isVerified}
    }
    const options = { headers: headers};
    return this.http.put<any>(this.apiUrl, JSON.stringify(data), options);
  }

  setPassword(password: string, uid: string): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    let data: any = {
      urlSlug: '/users/' + uid,
      data: {password: password, tempPassword:""}
    }
    const options = { headers: headers};
    return this.http.put<any>(this.apiUrl, JSON.stringify(data), options);
  }

  userSavePreferences(withPaper: Paper): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', '/classes/Paper/');
    params = params.set('data',JSON.stringify(withPaper));
    const options = { headers: headers};
    return this.http.post<any>(this.apiUrl, params, options).pipe(
      map((response: any) => {
          if(!response.error) {
            this.savePaperRef(response);
          }
          return response;
        }
      ));
  }

  getUserByAuthToken(token?: string): Observable<User | ObjectRef | DataResponse | Error> {
    let params: HttpParams = new HttpParams();
    params = params.set('searchQuery',
      JSON.stringify( {authToken:token}));
    params = params.set('urlSlug', '/users');
    params = params.set('parameters', '?order=updatedAt');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        if (response.results.length > 0){
          this.user = response.results[0];
          this.saveUser(this.user);
        }
        return response;
      })
    );
  }

  getUserByEmail(email: string): Observable<User | ObjectRef | DataResponse | Error> {
    let params: HttpParams = new HttpParams();
    params = params.set('searchQuery', JSON.stringify( {username:email}));
    params = params.set('urlSlug', '/users');
    params = params.set('parameters', '?order=updatedAt');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {console.log(response)
        if (response.results.length > 0){
          this.user = response.results[0];
          this.saveUser(this.user);
        }
        return response;
      })
    );
  }

  getUser(withUserRef?: ObjectRef, fromCache?: boolean): Observable<User | ObjectRef | DataResponse | Error> {
    if(fromCache){
      return of(JSON.parse(sessionStorage.getItem('X-User')) as User | ObjectRef);
    }
    let params: HttpParams = new HttpParams();
    params = params.set('searchQuery',
      JSON.stringify( {objectId: withUserRef ? withUserRef.objectId : this.userRef.objectId}));
    params = params.set('urlSlug', '/users');
    params = params.set('parameters', '?order=updatedAt');
    const options = { withCredentials: true, params:params};
    return this.http.get<DataResponse | Error>(this.apiUrl, options).pipe(
      map((response: DataResponse) => {
        if (response.results.length > 0){
          this.user = response.results[0];
          this.saveUser(this.user);
        }
        return response;
      })
    );
  }


  verify(user: User, authToken?: string): Observable<any> {
    authToken = (authToken) ? authToken : user.authToken;
    let params: HttpParams = new HttpParams();
    params = params.set('to', user.email);
    params = params.set('subject', 'Epaperweekly.com | Account Verification');
    params = params.set('msg', 'Hi ' + user.firstName+ ", you're almost ready to start enjoying epaperweekly.com. Simply click the button below to verify your email address.");
    params = params.set('html',
      "<html>" +
      "<head><style type=\"text/css\"> " +
      "body{ " +
        "background-color:#ffffff !important;" +
      "} \n" +
      "a.link{ background-color:#000000;" +
        "border-radius:3px;color:#ffffff;" +
        "padding:10px;display:inline-block;" +
        "font-family:sans-serif;font-size:16px;" +
        "line-height:44px;text-align:center;" +
        "text-decoration:none;width:150px;" +
        "-webkit-text-size-adjust:none;" +
        "mso-hide:all;" +
      "}\n" +
      "td {text-align: center}\n"+
      ":root {" +
      "    color-scheme: light dark;" +
      "    supported-color-schemes: light dark;" +
      "}\n"+
      "</style></head>"+
      "<body>" +
      "<table width=\"100%\"  cellpadding='5' cellspacing='5'>" +
      "<tr><td><img src=\"http://epaperweekly-gw.herokuapp.com/img/epaperweekly.png\" border=\"0\" style=\"margin-bottom:20px\"></td></tr>"+
      "<tr><td bgcolor=\"#ffffff\" style=\"background: #ffffff\"><p>Hi " + user.firstName+ ", you're almost ready to start enjoying epaperweekly.com.</p><p>Simply click the button below to verify your email address.</p><td></tr>" +
      "<tr><td bgcolor=\"#ffffff\"><a href='https://www.epaperweekly.com/verify/"+authToken+"' class=\"link\" style=\"margin-top:20px\">Verify email address</a></td></tr>" +
      "</table>"+
      "</body></html>");
    if(!user.emailVerified) {
      return this.http.post<any>(this.apiUrl + "/mail.php", params).pipe(
        map((response: any) => {
            return response;
          }
        ));
    } else {
      return new Observable();
    }
  }

  userSignOut(withSessionToken?: string): Observable<DataResponse | Error> {
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', '/logout');
    params = params.set('X-Identifiable-Session-Token', withSessionToken ? withSessionToken : this.user.sessionToken);
    return this.http.post<DataResponse | Error>(this.apiUrl, params).pipe(
      map((response: any) => {
          sessionStorage.removeItem('X-User');
          delete(this.user);
          return response;
        }
      ));
  }

  saveUser(user:any):void{
    this.user = user;
    sessionStorage.setItem('X-User', JSON.stringify(user));

  }

  getUserRef():User{
    return JSON.parse(sessionStorage.getItem('X-User'));
  }

  saveUserRef(userRef: any):void{
    this.userRef = userRef;
    sessionStorage.setItem('X-user-ref', JSON.stringify(this.userRef));
  }

  savePaperRef(paperRef: any):void{
    sessionStorage.setItem('X-paper-ref', JSON.stringify(paperRef));
  }

  getPaperRef() : ObjectRef {
    return JSON.parse(sessionStorage.getItem('X-paper-ref'));
  }

  savePaymentRef(paymentRef: any):void{
    sessionStorage.setItem('X-payment-ref', JSON.stringify(paymentRef));
  }

  getPaymentRef() : ObjectRef {
    return JSON.parse(sessionStorage.getItem('X-payment-ref'));
  }


  getAuthenticatedUserRef() : ObjectRef {
    return JSON.parse(sessionStorage.getItem('X-user-ref'));
  }

  getAuthenticatedUser() : User {
    return JSON.parse(sessionStorage.getItem('X-User'));
  }
}
