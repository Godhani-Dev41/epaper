import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import {Event, NavigationEnd, Router} from "@angular/router";
import {User} from "./shared/user";

@Component({
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  public copyright: string;
  public isFooterActive: boolean = true;
  constructor(private router: Router) { }

  ngOnInit() {

    this.router.events.subscribe(( event: Event) => {
      if(event instanceof NavigationEnd ) {
        if ((event.url.indexOf('paper') !== -1 && event.url.indexOf('papers')  === -1) || event.url === '/') {
          this.isFooterActive = false;
        }
      }
    });

    this.copyright = 'Copyright CEIGON © ' + moment(new Date()).toDate().getFullYear();
  }

}
