import {Component, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Event, NavigationEnd, Router} from '@angular/router';
import {AuthenticationService} from './account/authentication.service';
import {User} from './shared/user';

@Component({
  selector : 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public cachedUser: User;
  @Input() public isLoginActive: boolean = false;
  @Input() public isSignupActive: boolean;
  @Input() public isHome: boolean;
  @Input() public isFooterSection: boolean;
  @Input() public isPaperActive: boolean = false;
  @Input() public isLoggedIn: boolean;
  @Output() public currentPath: string;
  constructor(private router: Router, private authenticationService: AuthenticationService) {

  }

  ngOnInit() {
    this.router.events.subscribe(( event: Event) => {
      if(event instanceof NavigationEnd ){
        this.currentPath = event.url;
        if(event.url.indexOf('signin') !== -1) {
          this.isPaperActive = false;
          this.isLoginActive = false;
          this.isSignupActive = true;
        } else if(event.url.indexOf('signup') !== -1 || event.url.indexOf('plans')  !== -1 || event.url.indexOf('plan') !== -1) {
          this.isLoginActive = false;
          this.isSignupActive = false;
        } else if(event.url.indexOf('paper') !== -1 && event.url.indexOf('papers')  === -1) {
          this.isPaperActive = true;
        } else if(event.url === '/') {
          this.isHome = true;
        } else if (event.url.indexOf('career') !== -1 || event.url.indexOf('about') !== -1 || event.url.indexOf('terms') !== -1 ) {
          this.isFooterSection = true;
        } else {
          this.isPaperActive = false;
          this.authenticationService.getUser(null, true).subscribe( cachedUser => {
            this.cachedUser = cachedUser as User;
            this.isLoginActive = this.cachedUser ? true : false;
            this.isSignupActive = (!(this.authenticationService.user || this.cachedUser));
          });

        }
      }
    });
  }

  public getLoginState(event){
    console.log(event);
  }

  goSignup(){
    this.router.navigateByUrl('/signup');
    console.log('trying to navigate')
  }

  goBack() {
    this.router.navigateByUrl('/');
  }

  goSigninOrSignOut() {
    if (!this.isLoginActive) {
      this.router.navigateByUrl('/signin');
    }else {
      this.authenticationService.userSignOut(this.cachedUser.sessionToken).subscribe( res => {
        if(!res['error']) {
          sessionStorage.removeItem("X-User");
          sessionStorage.removeItem("X-user-ref");
          sessionStorage.removeItem("X-payment-ref");
          sessionStorage.removeItem("X-subscription-ref");
          this.router.navigateByUrl('/signin');
        }
      });
    }
  }
}
