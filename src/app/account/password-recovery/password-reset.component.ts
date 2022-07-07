import {Component, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Event, NavigationEnd, Router} from "@angular/router";
import {AuthenticationService} from "../authentication.service";
import {AccountService} from "../account.service";
import {Pointer} from "../../shared/pointer";
import {User} from "../../shared/user";

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  providers: [AccountService]
})
export class PasswordResetComponent implements OnInit {
  @Input() public currentPath: string;
  public passwordResetForm: FormGroup;
  public loginForm: FormGroup;
  public showReset:boolean;
  private userPointer: Pointer;
  public loginFailureMessage: string;
  public hasSubmitted: boolean;
  public success: boolean;

  public user: User;
  constructor(private fb: FormBuilder,
              private router: Router,
              private authenticationService: AuthenticationService,
              private accountService: AccountService) { }

  ngOnInit() {
    if (this.router.url.lastIndexOf("reset") !== -1 && sessionStorage.getItem("X-User")) {
      this.showReset = true;
      this.user = this.authenticationService.getUserRef() as User;
      this.createPasswordResetForm();
    }else{
      sessionStorage.removeItem("X-User");
      sessionStorage.removeItem("token");
      this.showReset = false;
      this.createLoginForm();
    }
  }

  createPasswordResetForm() {
    this.passwordResetForm = this.fb.group({
      username: new FormControl('',  Validators.email),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      verifyPassword: new FormControl('', [Validators.compose(
        [Validators.required, this.validateAreEqual.bind(this)]
      )])
    });
  }

  createLoginForm() {
    this.loginForm = this.fb.group({
      username: new FormControl('',  Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  private validateAreEqual(fieldControl: FormControl) {
    if(!this.passwordResetForm){return}
    return fieldControl.value === this.passwordResetForm.get("password").value ? null : {
      NotEqual: true
    };
  }

  resetPassword() {
    if (this.passwordResetForm.valid) {
      console.log(this.user);
      const password = this.passwordResetForm.get("password").value;
      this.authenticationService.setPassword(password, this.user.objectId).subscribe(res => {
        this.hasSubmitted = true;
        console.log(res);
        this.router.navigateByUrl('/signin');
      }, err => {
        console.error(err);
      });
    }else{
      this.hasSubmitted = true;
    }
  }

  login() {
    if (this.loginForm.valid) {

      const username = this.loginForm.get("username").value;
      const password = this.loginForm.get("password").value;

      this.authenticationService.userSignInTemp(username,password).subscribe( res => {
        console.log(res);
        this.user = res["results"][0] as User;
        if(this.user){
          this.hasSubmitted = true;
          this.showReset = true;
          this.router.navigateByUrl('/forgot/password/reset');
        }else{
          this.success = false;
          this.loginFailureMessage = "Your username or password does not match our records.";
        }
      }, err => {
        console.error(err);
      })
    }else{
      this.hasSubmitted = false;
    }
  }
}
