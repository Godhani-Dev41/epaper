import { Component, OnInit } from '@angular/core';
import {SubscriptionService} from "./subscription.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  private routeSub: Subscription;
  private planId: string;
  public postQueryHelp: string = 'Post queries happen when a paper is generated and is based on the topics, interests, related country and other information gathered at the time your paper is created.';
  public downloadLimitHelp: string = 'The maximum number of papers downloaded each month. When you download a paper it converts it to a PDF that has been formatted for your device.';
  public articlesPerPaperLimitHelp: string = 'The maximum number of articles that are embedded in your paper. This also includes one daily quote.';
  public paperTemplateHelp: string = 'Once you have created a paper, we store all of the settings you selected. This allows you to easily get the latest news based on your previous preferences without having to recreate it.';

  constructor(private route: ActivatedRoute,
              private router: Router,
              public subscriptionService: SubscriptionService) {

  }


  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.planId = params['id'] as string;
    });
  }

  subscribe(planId:string) {
    this.planId = 'plan_'+planId;
    if(this.planId) {
      this.subscriptionService.getSubscriptionByPLanId(this.planId).subscribe( res => {
        console.log(res);
        this.router.navigateByUrl('/signup');
      }, err => {
        console.error(err);
      });
    }

  }
}
