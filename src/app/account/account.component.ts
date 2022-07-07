import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../shared/user';
import {ObjectRef} from '../shared/object-ref';
import {DataResponse} from '../shared/data-response';
import {AccountService} from './account.service';
import {AuthenticationService} from './authentication.service';
import {Pointer} from '../shared/pointer';
import * as uuid from 'uuid';
import {Router} from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  providers: [AccountService]
})
export class AccountComponent implements OnInit {
  public accountForm: FormGroup;
  private userPointer: Pointer;
  public hasSubmitted: boolean;

  public user: User;
  constructor(private fb: FormBuilder,
              private router: Router,
              private authenticationService: AuthenticationService,
              private accountService: AccountService) { }

  ngOnInit() {
    this.authenticationService.getUser(null, true).subscribe( res => {
      if(!res) {
        this.router.navigateByUrl('/signin');
        return false;
      }
      if(!res) {
        this.router.navigateByUrl('/signin');
        return false;
      }
      if(!this.authenticationService.user && (res as User).objectId){
        this.user = res as User;
      } else {
        this.user = this.authenticationService.user;
      }
      this.userPointer = {
        objectId: this.user.objectId,
        className: '_User',
        __type: 'Pointer'
      }
      this.createAccountForm(this.user);
    }, err => {
      console.log(err);
    });

  }

  createAccountForm(withUser: User) {
    if(withUser) {
      this.accountForm = this.fb.group({
        username: new FormControl(withUser.username,  Validators.email),
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        verifyPassword: new FormControl('', [Validators.compose(
          [Validators.required, this.validateAreEqual.bind(this)]
        )])
      });
    }else {
      this.accountForm = this.fb.group({
        username: new FormControl('',  Validators.email),
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        verifyPassword: new FormControl('', [Validators.compose(
          [Validators.required, this.validateAreEqual.bind(this)]
        )])
      });
    }

  }

  private validateAreEqual(fieldControl: FormControl) {
    if(!this.accountForm){return}
    return fieldControl.value === this.accountForm.get("password").value ? null : {
      NotEqual: true
    };
  }

  saveAccount() {

    const authToken:string = uuid.v4();
    let localUser: User = {
      username: this.accountForm.get("username").value as string,
      password: this.accountForm.get("password").value as string,
      emailVerified: false,
      authToken: authToken
    }
    if(this.accountForm.valid) {
      this.accountService.updateUser(localUser, this.user.objectId).subscribe(res => {

        let userRef: ObjectRef = {
          objectId: this.user.objectId,
          sessionToken: this.user.sessionToken
        }
        this.authenticationService.getUser(userRef, false).subscribe(res => {
          this.user = (res as DataResponse).results[0];
          this.accountService.accountUpdateVerify(this.user, authToken).subscribe(res => {
            console.log(res);
            this.hasSubmitted = true;
          }, err => {
            console.error(err);
          })
        }, err => {
          console.log(err)
        });
      }, err => {
        console.log(err)
      });
    }
  }
}
