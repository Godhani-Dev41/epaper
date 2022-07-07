import { Component, OnInit } from '@angular/core';
import * as uuid from 'uuid';
import {AccountService} from "../account.service";
import {AuthenticationService} from "../authentication.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "../../shared/user";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.css'],
  providers:[AccountService,AuthenticationService]
})
export class PasswordRecoveryComponent implements OnInit {
  public passwordSent:boolean;
  public recoveryForm:FormGroup;
  public submitted: boolean;
  public success: boolean;
  public failureMessage: string;
  public isVerified: boolean;
  public isCopied: boolean;
  public user: User;
  private routeSub: Subscription;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public authenticationService: AuthenticationService,
    public accountService:AccountService
  ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const token: string = params['token'] as string;
      if(token){
        this.authenticationService.getUserByAuthToken(token).subscribe(res => {
          this.user = res["results"][0] as User;
          console.log(this.user)
          if(this.user) {
            this.authenticationService.saveUser(this.user);
            if(!this.user.emailVerified) {
              this.authenticationService.setEmailVerified(true,this.user.objectId).subscribe( res => {
                //this.router.navigateByUrl('/signin');
              }, err => {
                console.log(err);
              });
            }
            this.isVerified = true;
          }

        }, err => {
          console.log(err);
        });
      }else{
        this.createRecoveryForm();
      }

    });
  }

  createRecoveryForm() {
    this.recoveryForm = this.fb.group({
      email: new FormControl('', Validators.email)
    });
  }

  goReset(){
    this.router.navigateByUrl('/forgot/password/login');
  }

  recoverPassword() {
    const authCode:string = uuid.v4();
    const tempPassword:string = uuid.v4();
    if (this.recoveryForm.valid) {
      const email = this.recoveryForm.get("email").value;
      this.authenticationService.getUserByEmail(email).subscribe(res =>{
        if(res["results"].length) {
          const user: User = res["results"][0] as User;
          this.accountService.updateUser({
            tempPassword: tempPassword,
            authToken: authCode,
            emailVerified: false
          }, user.objectId).subscribe(res => {
            this.accountService.recoverPasswordVerify(user, authCode).subscribe(res => {
              this.passwordSent = true;
              this.submitted = true;
            }, err => {

            });
          }, err => {
            console.error(err);
          });
        }else{
          this.success = false;
          this.failureMessage = "We don't have record of that email address on file.";
        }
      }, err => {
        console.error(err);
      });
    }else{
      this.submitted = true;
    }

  }

}
