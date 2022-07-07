import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NgxMasonryOptions} from "ngx-masonry";
import {PaperService} from "./paper.service";
import {AuthenticationService} from "../account/authentication.service";
import {User} from "../shared/user";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {Paper} from "../shared/paper";
import {Order} from "../shared/order";
import {Post} from "../shared/post";
import {Pointer} from "../shared/pointer";

@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [PaperService, AuthenticationService]
})
export class PaperComponent implements OnInit {
  public numColumns: number = 2;
  public gutterSize: number = 0;
  public maxWidth: number = 1404;
  public today: Date;
  public user: User;
  public userPointer: Pointer;
  public hasLoaded: boolean = false;
  public isAuthorized: boolean;
  public location: string;
  public paper: Paper;
  public loadedPosts: string[] = [];
  public colWidth: number = (this.maxWidth / this.numColumns) - (this.numColumns * this.gutterSize );
  public options: NgxMasonryOptions = {
    horizontalOrder: true,
    fitWidth: false,
    columnWidth: this.colWidth
  };
  private routeSub: Subscription;

  constructor(public paperService: PaperService,
              private route: ActivatedRoute,
              private router: Router,
              public authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.today = new Date();
    this.routeSub = this.route.params.subscribe(params => {
      const license: string = params['license'] as string;
      const pId: string = params['pid'] as string;
      this.paperService.getOrdersByLicense(license).subscribe(res => {
        let order: Order = res["results"][0] as Order;
        if(order) {
          this.paperService.getPaper(pId).subscribe(res => {
            this.paper = res['results'][0] as Paper;
            for( let post of  this.paper.posts) {
              this.loadedPosts.push(post.uuid ? post.uuid: "quote");
            }
            this.location = this.paper.countries ? this.paper.countries['name'] : "Somewhere";
            this.isAuthorized = true;
            this.hasLoaded = true;
          }, err => {
            console.error(err);
          });
        }else{
          this.hasLoaded = true;
          this.isAuthorized = false;
        }
      }, err => {
        console.error(err);
      })
    });
  }
}
