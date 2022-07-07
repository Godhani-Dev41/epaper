import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {PS_ROOT} from '../shared/global';
import {DataResponse} from '../shared/data-response';
import {Observable} from 'rxjs/index';
import {Pointer} from '../shared/pointer';
import {User} from '../shared/user';
import {Error} from "../shared/error";
import {map} from "rxjs/operators";

@Injectable()
export class AccountService {
  private readonly apiUrl: string;
  constructor(private http: HttpClient, @Inject(PS_ROOT) apiRoot: string) {
    this.apiUrl = apiRoot;
  }

  public updateUser(withUser: User, withid: string): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    if(withUser.updatedAt)delete(withUser.updatedAt);
    if(withUser.createdAt)delete(withUser.createdAt);
    let data: any = {
      urlSlug: '/users/' + withid,
      data: withUser
    }
    delete(withUser.objectId);
    const options = { headers: headers};
    return this.http.put<any>(this.apiUrl, JSON.stringify(data), options);
  }

  recoverPasswordVerify(user: User, authToken?: string): Observable<any> {
    authToken = (authToken) ? authToken : user.authToken;
    let params: HttpParams = new HttpParams();
    params = params.set('to',user.email);
    params = params.set('subject', 'Epaperweekly.com | Password Recovery');
    params = params.set('html',
      "<html>" +
      "<head><style type=\"text/css\"> " +
      "body{ " +
      "background-color:#ffffff !important;" +
      "} \n" +
      "a.link{ background-color:#000000;" +
      "border-radius:3px;color:#ffffff;" +
      "padding:5px;display:inline-block;" +
      "font-family:sans-serif;font-size:16px;" +
      "line-height:44px;text-align:center;" +
      "text-decoration:none;width: 500px;" +
      "-webkit-text-size-adjust:none;" +
      "mso-hide:all;" +
      "}\n" +
      "td {text-align: center}\n"+
      "td p {text-align: left}\n"+
      ":root {" +
      "    color-scheme: light dark;" +
      "    supported-color-schemes: light dark;" +
      "}\n"+
      "</style></head>"+
      "<body>" +
      "<table width=\"100%\"  cellpadding='5' cellspacing='5'>" +
      "<tr><td><img src=\"https://epaperweekly-gw.herokuapp.com/img/epaperweekly.png\" border=\"0\" style=\"margin-bottom:20px\"></td></tr>"+
      "<tr><td bgcolor=\"#ffffff\" style=\"background: #ffffff\">" +
      "<div style=\"margin-left:auto;margin-right:auto; width:500px\">"+
      "<p>You are receiving this because you (or someone else) requested that your password be recovered.</p>" +
      "<p>If you feel you received this in error, you can either ignore this or contact us at support.</p>" +
      "<p>Our support email is <a href=\"mailto:support@epaperweekly.com\">support@epaperweekly.com</a>.</p>" +
      "<p style='margin-top:10px'>To verify, click the link below.</p>" +
      "</div>"+
      "<td></tr>" +
      "<tr><td bgcolor=\"#ffffff\"><a href='https://www.epaperweekly.com/forgot/password/verify/"+authToken+"' class=\"link\" style=\"margin-top:20px\">Restore my password</a></td></tr>" +
      "</table>"+
      "</body></html>");

    return this.http.post<any>(this.apiUrl + "/mail.php", params).pipe(
      map((response: any) => {
          return response;
        }
      ));
  }

  accountUpdateVerify(user: User, authToken?: string): Observable<any> {
    authToken = (authToken) ? authToken : user.authToken;
    let params: HttpParams = new HttpParams();
    params = params.set('to', user.email);
    params = params.set('subject', 'Epaperweekly.com | Email verification');
    params = params.set('msg', 'Hi ' + user.firstName+ ", Your account has updated.");
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
      "<tr><td><img src=\"https://epaperweekly-gw.herokuapp.com/img/epaperweekly.png\" border=\"0\" style=\"margin-bottom:20px\"></td></tr>"+
      "<tr><td bgcolor=\"#ffffff\" style=\"background: #ffffff\"><p>Hi " + user.firstName+ ", your account has been updated.</p><p>To verify, click the link below.</p><td></tr>" +
      "<tr><td bgcolor=\"#ffffff\"><a href='https://www.epaperweekly.com/verify/"+authToken+"' class=\"link\" style=\"margin-top:20px\">Verify email address</a></td></tr>" +
      "</table>"+
      "</body></html>");

      return this.http.post<any>(this.apiUrl + "/mail.php", params).pipe(
        map((response: any) => {
            return response;
          }
        ));
  }

  public uploadPhoto(withUser: User, photo: File, data: FormData): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    let params: HttpParams = new HttpParams();
    params = params.set('urlSlug', 'files/'+photo.name);
    params = params.set('token', withUser.sessionToken);
    params = params.set('contentType', photo.type);
    const options:any = {
      headers: headers,
      reportProgress: true,
      observe: 'events'}

    return this.http.post<any>(this.apiUrl, data, options).pipe(
      map((response: any) => {
          return response;
        }
      ));
  }
  public career(data:FormData): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('email', (data.get("email") as string));
    params = params.set('name', (data.get("name") as string));
    params = params.set('position',  (data.get("position") as string));
    params = params.set('comments',  (data.get("comments") as string));

    return this.http.post<any>(this.apiUrl+"/career.php", params).pipe(
      map((response: any) => {
          return response;
        }
      ));
  }

  public contact(data:FormData): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.set('email', (data.get("email") as string));
    params = params.set('name', (data.get("name") as string));
    params = params.set('subject',  (data.get("subject") as string));
    params = params.set('comments',  (data.get("comments") as string));

    return this.http.post<any>(this.apiUrl+"/contact.php", params).pipe(
      map((response: any) => {
          return response;
        }
      ));
  }

}
