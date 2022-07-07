import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {AppStateService} from './app-state.service';
import {LoginComponent} from './account/login/login.component';
import {StripeScriptTag} from 'stripe-angular';
import {STRIPE_PUB_KEY} from './shared/global';
import {Router} from "@angular/router";
import * as schedule from 'node-schedule';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppStateService]
})
export class AppComponent{
  @Output() loginIsActive: boolean = false;
  componentAdded(component){
    this.loginIsActive = !(component instanceof LoginComponent);
  }
  constructor(public StripeScriptTag: StripeScriptTag,
              public appStateService: AppStateService,
              private router: Router, @Inject(STRIPE_PUB_KEY)  key: string) {
    this.StripeScriptTag.setPublishableKey(key);
    //run scheduled paper generation
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = 1;
    rule.hour = 22;
    rule.minute = 33;

    var j = schedule.scheduleJob(rule, function(){
      appStateService.getOrders({}).subscribe( res =>{
        console.log(res);
      }, err => {
        console.log(err);
      })
    });


  }
}

