import { Component, OnInit } from '@angular/core';
import {AccountService} from '../account.service';
import {DataResponse} from '../../shared/data-response';
import {User} from '../../shared/user';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService} from '../authentication.service';
import {Error} from '../../shared/error';
import {ObjectRef} from "../../shared/object-ref";
import * as uuid from 'uuid';
import {SubscriptionService} from "../../subscription/subscription.service";

@Component({
  selector: 'app-signUp',
  templateUrl: './signUp.component.html',
  styleUrls: ['./signUp.component.css'],
  providers: [AccountService]
})
export class SignUpComponent implements OnInit {
  public response: DataResponse;
  public user: User;
  public userRef: ObjectRef;
  public subscriptionRef: ObjectRef;
  public success: boolean;
  public failureMessage: string;
  public signupForm: FormGroup;
  public invalid:any[] = [];
  public hasSubmitted:boolean;
  constructor(private accountService: AccountService,
              private subscriptionService: SubscriptionService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private fb: FormBuilder) {

  }

  ngOnInit() {
    sessionStorage.removeItem("verifySent");
    sessionStorage.removeItem("token");
    localStorage.removeItem("toggleAutoRechargeWarning");

    this.subscriptionRef = this.subscriptionService.getSubscriptionRef();
    if(!this.subscriptionRef){
      this.router.navigateByUrl('plans');
    }else{
      this.userRef = this.authenticationService.getAuthenticatedUserRef();
      if(this.userRef) {
        this.router.navigateByUrl('signup/payment');
      }
    }
    this.createSignupForm();
  }

  createSignupForm() {
    this.signupForm = this.fb.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', Validators.email),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      verifyPassword: new FormControl('', [Validators.compose(
        [Validators.required, this.validateAreEqual.bind(this)]
      )])
    });
  }

  private validateAreEqual(fieldControl: FormControl) {
    if(!this.signupForm){return}
    return fieldControl.value === this.signupForm.get("password").value ? null : {
      NotEqual: true
    };
  }

  goSignIn() {
    this.router.navigateByUrl('signin');
  }

  doSignup(){
    console.log(this.user)


    if(!this.signupForm.invalid) {
      this.user = {
        firstName: this.signupForm.get('firstName').value,
        lastName: this.signupForm.get('lastName').value,
        email: this.signupForm.get('email').value,
        username: this.signupForm.get('email').value,
        password: this.signupForm.get('password').value,
        authToken: uuid.v4(),
        emailVerified: false
      };
      this.authenticationService.getUserByEmail(this.user.email).subscribe( res => {
        if(res["results"].length > 0){
          this.failureMessage = "This account already exists."
          this.success = false;
          this.hasSubmitted = true;
        }else{
          this.authenticationService.saveUser(this.user);
          this.router.navigateByUrl('signup/payment');
        }
      }, err => {
        this.failureMessage = "Oops! There was an error processing your request."
        this.success = false;
        this.hasSubmitted = true;
      });

    }else {
      this.hasSubmitted = true;
      this.findInvalidControls();
      this.success = false;
      this.failureMessage = "One or more of the fields were left blank, or invalid."
    }

  }
  checkFieldValid(fieldName) {console.log(fieldName)
    return this.invalid.length > 0 && !(this.invalid.find( ({ name }) => name === fieldName ));
  }
  findInvalidControls() :any[] {
    this.invalid = [];
    const controls = this.signupForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        let meta = {
          name: name,
          message: name +" is not valid."
        }
        this.invalid.push(meta);
      }
      console.log(this.invalid.length)
    }
    return this.invalid;
  }
}
