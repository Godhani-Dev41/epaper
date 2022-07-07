import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  NgModel,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {User} from '../shared/user';
import {Pointer} from '../shared/pointer';
import {AuthenticationService} from '../account/authentication.service';
import {AccountService} from '../account/account.service';
import {ObjectRef} from '../shared/object-ref';
import {DataResponse} from '../shared/data-response';
import {Router} from '@angular/router';
import {PayoutService} from "../account/payout/payout.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [AccountService,PayoutService]
})
export class ProfileComponent implements OnInit {
  public profileForm: FormGroup;
  private userPointer: Pointer;
  public user: User;
  public shouldEditEmail: boolean;
  public submitted: boolean;
  private selectedFile: File;

  constructor(private sfb: FormBuilder,
              private ofb: FormBuilder,
              private router: Router,
              private authenticationService: AuthenticationService,
              private paymentService: PayoutService,
              private accountService: AccountService) { }

  ngOnInit() {
    this.authenticationService.getUser(null, true).subscribe( res => {
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
      this.createProfileForm(this.user);
    }, err => {
      console.log(err);
    });
  }
  createProfileForm(withUser: User) {
    if(withUser) {
      this.profileForm = this.sfb.group({
        firstName: new FormControl(withUser.firstName, Validators.required),
        lastName: new FormControl(withUser.lastName, Validators.required),
        phone: new FormControl(withUser.phone, Validators.minLength(10)),
        email: new FormControl(withUser.email, (this.shouldEditEmail) ? Validators.email : null)
      });
    }else {
      this.profileForm = this.sfb.group({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        phone: new FormControl('',  Validators.minLength(10)),
        email: new FormControl('', (this.shouldEditEmail) ? Validators.email : null)
      });
    }
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile)
    const uploadData = new FormData();
    uploadData.append('myFile', this.selectedFile, this.selectedFile.name);
    this.accountService.uploadPhoto(this.user,this.selectedFile,uploadData).subscribe( res => {
      console.log(res);
    }, err => {
     console.error(err);
    })
  }

  saveUserProfile() {
    if (this.profileForm.valid) {
      let localUser: User = {
        firstName: this.profileForm.get("firstName").value,
        lastName: this.profileForm.get("lastName").value,
        phone: this.profileForm.get("phone").value,
        email: this.profileForm.get("email").value
      };
      this.accountService.updateUser(localUser, this.user.objectId).subscribe(res => {
        let userRef: ObjectRef = {
          objectId: this.user.objectId,
          sessionToken: this.user.sessionToken
        }
        this.authenticationService.getUser(userRef, false).subscribe(res => {
          this.user = (res as DataResponse).results[0];
          console.log(this.user)
          this.submitted = true;
        }, err => {
          console.log(err)
        });
      }, err => {
        console.log(err)
      });
    }else{
      this.submitted = false;
    }
  }

  doChangeEmail() {
    this.shouldEditEmail = true;
    this.profileForm.get("email").validator = Validators.email;
  }
}
