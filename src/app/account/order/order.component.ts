import {ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {saveAs as importedSaveAs} from 'file-saver';
import {TagifyService} from '@yaireo/tagify'
import * as uuid from 'uuid';

import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import { Options } from '@angular-slider/ngx-slider';

import {Pointer} from "../../shared/pointer";
import {User} from "../../shared/user";
import {Router} from "@angular/router";
import {AuthenticationService} from "../authentication.service";
import {AccountService} from "../account.service";
import {ObjectRef} from "../../shared/object-ref";
import {Paper} from "../../shared/paper";
import {PaperService} from "../../paper/paper.service";
import {Order} from "../../shared/order";
import {Subscription} from "../../shared/subscription";
import {NgbModal, NgbModalRef, NgbNavChangeEvent,NgbModalConfig} from "@ng-bootstrap/ng-bootstrap";
import {Countries} from "../../shared/countries";
import {Topics} from "../../shared/topics";
import {Networks} from "../../shared/networks";
import {Error} from "../../shared/error";
import {Languages} from "../../shared/languages";
import {Platforms} from "../../shared/platforms";
import {Post} from "../../shared/post";
import {StripeOrder} from "../../shared/stripe-order";
import {PayoutService} from "../payout/payout.service";
import {PaymentMethod} from "../../shared/payment-method";
import {StripeCard} from "../../shared/stripe-card";
import {
  StripeService,
} from "ngx-stripe";

import {
  StripeElementsOptions as ElementsOptions,
  Token,
  StripeElements as Elements
} from '@stripe/stripe-js';
import {StripeSource} from "../../shared/stripe-source";
import {StripeCustomer} from "../../shared/stripe-customer";
import {Observable} from "rxjs";


interface SimpleSliderModel {
  value: number;
  options: Options;
}

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  providers: [AccountService,PayoutService,NgbModalConfig]
})
export class OrderComponent implements OnInit {

  @ViewChild('autoChargeContent', {}) autoRechargeContent: TemplateRef<any>;

  private paperModelRef: NgbModalRef;
  private paperInstallModelRef: NgbModalRef;
  private rechargeModelRef: NgbModalRef;
  private autoRechargeModelRef: NgbModalRef;
  private userPointer: Pointer;

  public selectedPaper: Paper;
  public selectedIndex: number;
  public papers: Paper[] = [];
  public user: User;
  public order: Order;
  public rechargeOrder: Order = {};
  public showHelp: boolean = false;
  public canDownload: boolean = true;
  public canAddPaper: boolean = true;
  public subscription: Subscription;
  public now : Date = new Date();
  public remainingDownloads: number;
  public remainingDataLoads: number;
  public totalDownloadsFromRechargeOrder: number = 0;
  public totalDataLoadsFromRechargeOrder: number = 0;
  public static RECHARGE_SKU: string = "sku_GeAZV1gaorBdz4";
  public toggleShowWarning: boolean = true;
  public remainingPapers: number = 0;
  public downloads: number[] = [];
  public dataLoads: number;
  public rechargeItem: any = {};
  public rechargePrice: number = 4.99;
  public rechargeQuantityOffset: number = 15;
  public rechargeTotal: number = 0;
  public fromIncrement: number = 0;
  public rechargeTotalPrice: number = 0;
  public isInternational:boolean;
  public doAutoRecharge: boolean;
  public includePhotos: boolean = true;
  public activeTab = 1;

  public subscriptionIsActive: boolean;
  public subscriptionIsPending: boolean;
  public subscriptionIsFailing: boolean;
  public subscriptionFailedMessage: string;

  public isDownloading: boolean;
  public subscriptionCanceled: boolean;
  public replaceCard: boolean;
  public downloadFailed: boolean;
  public isLoading: boolean;
  public orderIsLoading: boolean;
  public success: boolean;
  public failureMessage: string;
  public orderSucceeded: boolean;
  public showConfirm: boolean;
  public tabletConnectionFailed: boolean = true;
  public orderFailureMessage: string;

  public newsForm: FormGroup;
  public researchForm: FormGroup;
  public webForm: FormGroup;

  public billingForm: FormGroup;
  public rechargeForm: FormGroup;
  public topics = Topics;
  public languages = Languages;
  public networks = Networks;
  public platforms = Platforms;
  public countries = this.filterCountriesForNews();
  public defaultSource: any;
  public defaultPaymentMethod: PaymentMethod;
  public keywords: string[] = [];
  private platform: any;
  private topic: any;
  private language: any;
  private country: any;
  private network: any;

  elements: Elements;
  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;


  elementsOptions: ElementsOptions = {
    locale: 'en'
  };

  topicsConfig = {
    displayKey: "name", //if objects array passed which key to be displayed defaults to description
    search: true, //true/false for the search functionlity defaults to false,
    height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
    placeholder:'Select', // text to be displayed when no item is selected defaults to Select,
    customComparator: undefined, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
    limitTo: this.topics.length, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder:'Search', // label thats displayed in search input,
    searchOnKey: 'name', // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
  }

  networksConfig = {
    displayKey: "name", //if objects array passed which key to be displayed defaults to description
    search: true, //true/false for the search functionlity defaults to false,
    height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
    placeholder:'Select', // text to be displayed when no item is selected defaults to Select,
    customComparator: undefined, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
    limitTo: this.networks.length, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder:'Search', // label thats displayed in search input,
    searchOnKey: 'name', // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
  }

  platformsConfig = {
    displayKey: "name", //if objects array passed which key to be displayed defaults to description
    search: true, //true/false for the search functionlity defaults to false,
    height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
    placeholder:'Select', // text to be displayed when no item is selected defaults to Select,
    customComparator: undefined, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
    limitTo: this.platforms.length, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder:'Search', // label thats displayed in search input,
    searchOnKey: 'name', // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
  }

  countryConfig = {
    displayKey: "name", //if objects array passed which key to be displayed defaults to description
    search: true, //true/false for the search functionlity defaults to false,
    height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
    placeholder:'Select', // text to be displayed when no item is selected defaults to Select,
    customComparator: undefined, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
    limitTo: this.filterCountriesForNews().length, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder:'Search', // label thats displayed in search input,
    searchOnKey: 'name', // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
  }

  languageConfig = {
    displayKey: "name", //if objects array passed which key to be displayed defaults to description
    search: true, //true/false for the search functionlity defaults to false,
    height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
    placeholder:'Select', // text to be displayed when no item is selected defaults to Select,
    customComparator: ()=>{}, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
    limitTo: this.languages.length, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder:'Search', // label thats displayed in search input,
    searchOnKey: 'name' // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
  }

  verticalSlider: SimpleSliderModel = {
    value: 0,
    options: {
      floor: 0,
      ceil: 20,
      // step: 0,
      showTicks: true,
      showSelectionBar: true,
      showTicksValues: true,
      tickValueStep: 20,

      getLegend : (e) =>{
        if(e%2){
          return '';
        }
        return e + '' ;
      }
    }
  };

  constructor(private fb: FormBuilder,
              private router: Router,
              private modalService: NgbModal,
              private cd: ChangeDetectorRef,
              private paperService: PaperService,
              private payoutService: PayoutService,
              private stripeService: StripeService,
              private config: NgbModalConfig,
              private authenticationService: AuthenticationService) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    this.activeTab = changeEvent.nextId;
  }

  ngOnInit():void {

    this.authenticationService.getUser(null, true).subscribe( res => {
      if (!res || !(res as User).sessionToken) {
        this.router.navigateByUrl('/signin');
        return false;
      }
      if ((res as User).objectId) {
        this.user = res as User;
        this.userPointer = {
          objectId: this.user.objectId,
          className: '_User',
          __type: 'Pointer'
        }
      }

      this.toggleShowWarning = localStorage.getItem("toggleAutoRechargeWarning") && Number(localStorage.getItem("toggleAutoRechargeWarning")) > 0;
      this.getUsersPapers(this.userPointer);

    }, err => {
      console.error(err);
    });
  }
  filterCountriesForNews() {
    return  Countries.filter(function(i) {
      return i.newsOnly === true;
    });
  }
  getUsersPapers(userPointer: Pointer) {
    this.isLoading = true;
    this.totalDownloadsFromRechargeOrder = 0;
    this.totalDataLoadsFromRechargeOrder = 0;
    this.paperService.getOrdersByOwner(userPointer).subscribe( userOrderRes => {
      //console.log(userOrderRes)
      for(let order of userOrderRes['results']) {
        let o:Order = order as Order;
        if(o.type === "subscription") {
          this.order = o;
          const subscriptionId = this.order.data.id
          this.payoutService.getStripeSubscription(subscriptionId).subscribe(subRes => {
            //console.log(subRes);
            if(!subRes["error"]) {
              if (subRes.status === "incomplete_expired"
                || subRes.status === "canceled"
                || subRes.status === "unpaid"
                || subRes.status === "past_due") {
                this.subscriptionIsActive = false;
                this.subscriptionIsPending = false;
                this.subscriptionIsFailing = true;
                this.subscriptionCanceled = subRes.status === "canceled";
                this.subscriptionFailedMessage = this.subscriptionCanceled ? "Your subscription has been canceled." :"There is a billing issue with your account.";

                this.payoutService.updateOrder({
                  objectId: this.order.objectId,
                  data: subRes
                }).subscribe(orderRes => {
                  if(!orderRes["error"]){
                    //console.log("updated subscription on order",orderRes);
                  }else{
                    console.error(orderRes);
                  }

                }, err => {
                  console.error(err);
                })
              } else if(subRes.status === "incomplete") {
                this.subscriptionIsActive = false;
                this.subscriptionIsPending = true;
                this.subscriptionIsFailing = false;
                this.subscriptionFailedMessage = "There is a billing issue with your account. Please contact us within 24 hours to avoid service interruption.";
              } else{
                this.subscriptionIsActive = true;
                this.subscriptionIsPending = false;
                this.subscriptionIsFailing = false;
              }

              if (subRes.status === "incomplete" || subRes.status === "active" || subRes.status === "trialing") {
                this.subscription = this.order.subscription as Subscription;
                this.remainingDownloads = this.subscription.downloads;
                this.remainingDataLoads = this.subscription.dataLoads;
                this.paperService.getPapers(this.user).subscribe(paperRes => {
                  this.papers = paperRes['results'] as Paper[];
                  this.remainingPapers = this.remainingPapers != -1 ? this.subscription.papers - this.papers.length : -1;
                  this.canAddPaper = this.remainingPapers > 0;
                  this.updateDownloadCount();
                  this.updateDataLoadCount();

                  this.selectedPaper = undefined;
                  this.selectedIndex = undefined;
                  this.isLoading = undefined;
                  this.subscriptionIsFailing = false;
                  this.subscriptionFailedMessage = undefined;
                }, err => {
                });
              }
              //update users account
              this.payoutService.updateOrder({
                objectId: this.order.objectId,
                isActive: subRes.status !== "canceled",
                data: subRes
              }).subscribe(orderRes => {
                if (!orderRes["error"]) {
                  //console.log("updated subscription on order",orderRes);
                } else {
                  console.error(orderRes);
                }

              }, err => {
                console.error(err);
              })

            }else{
              this.subscriptionIsFailing = true;
              this.subscriptionFailedMessage = subRes.error.message;
              console.error(subRes)
            }
          });

          break;

        } else{
          this.totalDownloadsFromRechargeOrder += o.downloads
          this.totalDataLoadsFromRechargeOrder += o.dataLoads;
        }
      }

    }, err => {
      console.log(err);
    })

  }

  createRechargeForm() {
    this.rechargeForm = this.fb.group({
      quantity: new FormControl(1, Validators.min(1))
    });

  }

  createBillingForm(withCardInfo?: StripeCard) {
    if (withCardInfo) {
      this.billingForm = this.fb.group({
        cardHolder: new FormControl(withCardInfo.name, Validators.required),
        street1: new FormControl(withCardInfo.billing_address.line1, Validators.min(1)),
        street2: new FormControl(withCardInfo.billing_address.line2, null),
        city: new FormControl(withCardInfo.billing_address.city,null),
        state: new FormControl(withCardInfo.billing_address.state, null),
        country: new FormControl(withCardInfo.billing_address.country_code, Validators.required),
        zip: new FormControl(withCardInfo.billing_address.postal_code, Validators.min(1))
      });
    } else {
      this.billingForm = this.fb.group({
        cardHolder: new FormControl('', Validators.required),
        street1: new FormControl('', Validators.required),
        street2: new FormControl('', null),
        city: new FormControl('', null),
        state: new FormControl('', null),
        country: new FormControl('', Validators.required),
        zip: new FormControl('', Validators.required)
      });
    }
  }

  createForm(withPaper: Paper) {
    let platformFromStorage = sessionStorage.getItem("platform") ? JSON.parse(sessionStorage.getItem("platform")) : {};
    let platform = platformFromStorage.code ? platformFromStorage :'';
    if(withPaper) {
      if(withPaper.type.toLowerCase() === "news") {
        this.activeTab = 1;
      } else if (withPaper.type.toLowerCase() === "research") {
        this.activeTab = 2;
      } else {
        this.activeTab = 3;
      }
      this.newsForm = this.fb.group({
        languages: new FormControl(withPaper.preferredLanguage.length > 0 ? withPaper.preferredLanguage:'', null),
        networks: new FormControl(withPaper.networks, null),
        platforms: new FormControl(withPaper.platforms ? withPaper.platforms:platform, null),
        keywords: new FormControl(withPaper.keywords, null),
        topics: new FormControl(withPaper.interests.length > 0 ? withPaper.interests:'', null),
        countries: new FormControl(withPaper.countries ? withPaper.countries:'', null)
      });
      this.researchForm = this.fb.group({
        languages: new FormControl(withPaper.preferredLanguage.length > 0 ? withPaper.preferredLanguage:'', null),
        platforms: new FormControl(withPaper.platforms ? withPaper.platforms:platform, null),
        websites: new FormControl(withPaper.websites, null),
        people: new FormControl(withPaper.people, null),
        organizations: new FormControl(withPaper.organizations, null),
        keywords:  new FormControl(withPaper.keywords, null),
        topics: new FormControl(withPaper.interests.length > 0 ? withPaper.interests:'', null),
        countries: new FormControl(withPaper.countries ? withPaper.countries:'', null)
      });
      this.webForm = this.fb.group({
        platforms: new FormControl(withPaper.platforms? withPaper.platforms:platform, null),
        urls: new FormControl(withPaper.webPages, null)
      });
    } else {
      this.newsForm = this.fb.group({
        languages: new FormControl('', null),
        platforms: new FormControl(platform, null),
        networks: new FormControl('', null),
        keywords:  new FormControl('', null),
        topics: new FormControl('', null),
        countries: new FormControl('', null)
      });
      this.researchForm = this.fb.group({
        languages: new FormControl('', null),
        platforms: new FormControl(platform, null),
        websites: new FormControl('', null),
        people: new FormControl('', null),
        organizations: new FormControl('', null),
        keywords: new FormControl('', null),
        topics: new FormControl('', null),
        countries: new FormControl('', null)
      });

      this.webForm = this.fb.group({
        platforms: new FormControl(platform, null),
        urls: new FormControl('', null)
      });
    }
  }

  toggleReplaceCard(save?:boolean) {

    if(save && this.replaceCard) {
      this.saveRechargeCard();
      if(this.billingForm.valid){
        this.replaceCard = !this.replaceCard;
        this.verticalSlider.options = Object.assign({}, this.verticalSlider.options, {readOnly: this.replaceCard});
        this.showConfirm = false;
      }
    }else{
      this.replaceCard = !this.replaceCard;
      this.verticalSlider.options = Object.assign({}, this.verticalSlider.options, {readOnly: this.replaceCard});
      this.showConfirm = false;
    }
  }

  addUpdatePaper(content, index?: number) {
    this.failureMessage = undefined;
    if (index != null) {
      this.selectedIndex = index;
      this.selectedPaper = this.papers[index];
      this.createForm(this.selectedPaper as Paper);
    }else{
      this.createForm(null);
    }
    this.paperModelRef = this.modalService.open(content, {size: 'lg'});
  }
  handleConnectionError() {
    this.tabletConnectionFailed = true;
  }
  openPaperInstall(content) {
    this.tabletConnectionFailed = false;
    this.paperInstallModelRef = this.modalService.open(content, {size: 'lg',backdrop: 'static', keyboard:false});
  }

  setAutoRechargeWarning(event){
    const checkbox = event.target;
    this.toggleShowWarning = checkbox.checked;
    localStorage.setItem("toggleAutoRechargeWarning", "" + Number(this.toggleShowWarning));
  }

  showAutoRecharge(content) {
    if(!this.modalService.hasOpenModals()) {
      this.autoRechargeModelRef = this.modalService.open(content, {size: 'lg'});
    }
  }

  test() {
    this.showAutoRecharge(this.autoRechargeContent);
  }
  updateDataLoadCount() {
    this.paperService.getDataLoadCount(null,this.userPointer ).subscribe( res =>{
      this.remainingDataLoads = (this.subscription.dataLoads + this.totalDataLoadsFromRechargeOrder) - res.count;
      this.canAddPaper = this.remainingDataLoads > 0;
      this.showHelp = this.remainingDownloads == this.subscription.downloads;
      this.handleAutoRecharge();
    }, err =>{
      console.error(err);
    });
  }

  updateDownloadCount() {
    this.paperService.getDownloadCount( null,this.userPointer ).subscribe( res =>{
      this.remainingDownloads = (this.subscription.downloads + this.totalDownloadsFromRechargeOrder)- res.count;
      this.canDownload = this.remainingDownloads > 0;
      this.showHelp = this.remainingDownloads == this.subscription.downloads;

      let i = 0;
      for (let paper of this.papers) {
        let count = 0;
        for (var download of res.results) {
          if(paper.objectId === (download['paper'] as ObjectRef).objectId) {
            count ++;
          }
        }
        this.downloads[i] = count;
        i++;
      }
      this.handleAutoRecharge();
    }, err =>{
      console.error(err);
    });
  }

  doRemove(paper: Paper) {
      this.paperService.removePaper(paper).subscribe( res =>{
        this.getUsersPapers(this.userPointer);
      }, err =>{
        console.log(err);
      });
  }

  download(paper: Paper) {
    this.selectedPaper = paper;
    this.isDownloading = true;
    this.downloadFailed = undefined;
    this.paperService.addDownload({
      subscription:{
        objectId: this.subscription.objectId,
        className: 'Subscription',
        __type: 'Pointer'
      },
      order: {
        objectId: this.order.objectId,
        className: 'Order',
        __type: 'Pointer'
      },
      paper: {
        objectId: paper.objectId,
        className: 'Paper',
        __type: 'Pointer'
      },
      createdBy:this.userPointer
    }).subscribe(res => {
      let url = paper.type.toLowerCase() !== "web" ? "https://epaperweekly.herokuapp.com/paper/"+this.order.license+"/"+paper.objectId : paper.webPages[0].display;
      this.paperService.downloadPaper(url, this.user).subscribe(res => {
        let language  = paper.preferredLanguage.length > 0 ? paper.preferredLanguage[0].code+"-": "";
        let country = paper.countries && paper.countries['code'] ? paper.countries['code']+"-": "";
        let web = paper.type.toLowerCase() === "web" ? "web-" : ""
        importedSaveAs(res as Blob,
          "epaperweekly-"+web+language.toLowerCase()+country.toLowerCase()+this.now.getTime()+".pdf");
        this.updateDownloadCount();
        this.isDownloading = false;
        this.selectedPaper = undefined;
        this.downloadFailed = undefined;
      }, err=> {
        this.downloadFailed = true;
        this.isDownloading = false;
        console.error(err);
      })
    }, err => {
      console.error(err);
    });
  }

  dataLoad(paper: Paper) {
    this.paperService.addDataLoad({
      subscription:{
        objectId: this.subscription.objectId,
        className: 'Subscription',
        __type: 'Pointer'
      },
      order: {
        objectId: this.order.objectId,
        className: 'Order',
        __type: 'Pointer'
      },
      paper: {
        objectId: paper.objectId,
        className: 'Paper',
        __type: 'Pointer'
      },
      createdBy:this.userPointer
    }).subscribe(res => {
      this.dataLoads++;
      this.updateDataLoadCount();
    }, err => {
      console.error(err);
    });
  }

  topicsSelectionChanged( event) {
    this.topic = event.value
  }

  networksSelectionChanged( event) {
    this.network = event.value
  }

  platformSelectionChanged( event) {
    this.platform = event.value
    sessionStorage.setItem("platform", JSON.stringify(this.platform));
  }

  languageSelectionChanged( event) {
    this.language = event.value
  }

  countrySelectionChanged( event) {
    this.country = event.value
  }

  savePaper(paper :Paper, refresh?: boolean){
    // save paper
    if((!this.selectedPaper && !paper.objectId) || refresh) {

      if(refresh){
        delete(paper.objectId);
        delete(paper.updatedAt);
        delete(paper.createdAt);
      }
      this.paperService.savePaper(paper).subscribe(
        res => {
          if((res as Error).code) {
            this.success = false;
            this.failureMessage = (res as Error).error;
          } else {
            this.getUsersPapers(this.userPointer);
            //close if window open
            if(this.paperModelRef){
              this.paperModelRef.close();
            }
            this.dataLoad(paper);
          }
          this.isLoading = false;
        }, err => {
          this.success = false;
          this.isLoading = false;
          console.error(err);
        }
      )
    }else{
      paper.objectId = this.selectedPaper.objectId;
      this.paperService.updatePaper(paper).subscribe(res => {
        //close if window open
        this.isLoading = false;
        if(this.paperModelRef){
          this.paperModelRef.close();
          this.getUsersPapers(this.userPointer);
        }
      }, error => {
        this.success = false;
        this.isLoading = false;
        this.failureMessage = error;
        console.error(error);
      });
    }
  }

  doSavePaper(paper? :Paper, refresh?: boolean) {
    this.isLoading = true;
    paper = paper ? paper : {
      includePhotos: this.includePhotos,
      createdBy: this.userPointer
    }
    paper.posts = [];
    if(this.activeTab == 1) {
      paper.type = "News";
      paper.interests = this.newsForm.get('topics').value ? this.newsForm.get('topics').value : [];
      paper.networks  = this.newsForm.get('networks').value ? this.newsForm.get('networks').value : [];
      paper.platforms  = this.newsForm.get('platforms').value ? this.newsForm.get('platforms').value : null;
      paper.keywords  = this.newsForm.get('keywords').value ? this.newsForm.get('keywords').value : [];
      paper.countries = this.newsForm.get('countries').value ? this.newsForm.get('countries').value : null;
      paper.preferredLanguage =  this.newsForm.get('languages').value ? this.newsForm.get('languages').value :[];
      paper.webPages = [];
    }else if(this.activeTab == 2) {
      paper.type = "Research";
      paper.websites  = this.researchForm.get('websites').value ? this.researchForm.get('websites').value : [];
      paper.people  = this.researchForm.get('people').value ? this.researchForm.get('people').value : [];
      paper.platforms  = this.researchForm.get('platforms').value ? this.researchForm.get('platforms').value : null;
      paper.organizations  = this.researchForm.get('organizations').value ? this.researchForm.get('organizations').value : [];
      paper.interests = this.researchForm.get('topics').value ? this.researchForm.get('topics').value : [];
      paper.keywords  = this.researchForm.get('keywords').value ? this.researchForm.get('keywords').value : [];
      paper.countries = this.researchForm.get('countries').value ? this.researchForm.get('countries').value : null
      paper.preferredLanguage =  this.researchForm.get('languages').value ? this.researchForm.get('languages').value :[];
      paper.webPages = [];
    } else {
      paper.websites = [];
      paper.people = [];
      paper.keywords = [];
      paper.platforms  = this.webForm.get('platforms').value ? this.webForm.get('platforms').value : null;
      paper.countries = null;
      paper.organizations = [];
      paper.preferredLanguage = [];
      paper.interests = [];
      paper.type = "Web";
      paper.posts = [];
      paper.webPages = this.webForm.get('urls').value ? this.webForm.get('urls').value : [];
    }
    this.paperService.gePaperData(paper, false, new Date(), 50).subscribe(res => {
      if(paper.type.toLowerCase() === "web") {
        this.savePaper(paper, refresh);
        return;
      }
      paper.posts = res.posts as Post[];
      this.paperService.getQuoteData({}, false).subscribe(res => {
        let quote: any = res.contents.quotes[0];
        paper.posts.unshift({text: quote.quote, author: quote.author});
        this.savePaper(paper, refresh);

      }, err => {
        this.success = false;
        this.isLoading = false;
        console.error(err);
      });
    }, err => {
      this.success = false;
      this.isLoading = false;
      console.error(err);
    });

  }

  countryChanged() {
    const country = this.billingForm.get('country').value;
    this.isInternational = country.toUpperCase() !== "US";
  }

  doCancel(){

  }

  doClose(){
    if(this.rechargeOrder.isActive) {
      this.getUsersPapers(this.userPointer);
    }
    if (this.rechargeModelRef) this.rechargeModelRef.close();
  }

  createOrRetrieveCustomer(customerId?: string, sourceId?: string) :Observable<StripeCustomer> {
    const fullName: string[] = [];
    fullName.push(this.user.firstName);
    fullName.push(this.user.lastName);
    if (!customerId) {
      return this.payoutService.createStripeCustomer({
        source: sourceId,
        email: this.user.email,
        description:
          this.user.fullName ? this.user.fullName : fullName.join(' ') + ' (' + this.user.objectId + ')' + ' card info'
      });
    } else {
      return this.payoutService.getStripeCustomer(customerId);
    }
  }

  rechargeSubscription(content){
    this.rechargeModelRef = this.modalService.open(content, {size: 'lg'});
    this.orderSucceeded = false;
    this.orderFailureMessage = undefined;
    this.createRechargeForm();
    this.createBillingForm();
    this.fromIncrement = 0;
    this.rechargeTotalPrice = 0;
    this.rechargeTotal = 0;
    this.remainingDownloads += this.rechargeTotal;
    this.remainingDataLoads += this.rechargeTotal;

    this.payoutService.getPaymentMethod(this.userPointer,true).subscribe( res =>{
      this.defaultPaymentMethod = res.results[0];
      this.defaultSource = this.defaultPaymentMethod.metaData.sources.data[0];
      this.orderIsLoading = true;
      this.stripeService.elements(this.elementsOptions)
        .subscribe(elements => {
          this.elements = elements;
          // Only mount the element the first time
          if (!this.card) {
            this.card = this.elements.create('card', {
              style: {
                base: {
                  iconColor: '#666EE8',
                  color: '#31325F',
                  lineHeight: '38px',
                  fontWeight: 300,
                  '::placeholder': {
                    color: '#CFD7E0'
                  }
                }
              }
            });
            this.card.mount('#card-element');
            this.card.addEventListener('change', this.cardHandler);
          }
          this.orderIsLoading = false;
        });
    }, err => {
      this.orderIsLoading = false;
      console.error(err);
    });
  }

  doRecharge(qty?:number){
    this.orderIsLoading = true;
    let order:StripeOrder = {
      currency: "usd",
      customer: this.user.customerId,
      "metadata[order_id]": this.order.objectId,
      "items[0][quantity]": qty ? qty : Number(this.rechargeForm.get('quantity').value),
      "items[0][parent]":"sku_GeAZV1gaorBdz4"
    };

    this.payoutService.createStripeOrder(order).subscribe(orderRes =>{
      if(!orderRes.error){
        order.customer = orderRes.customer;
        this.payoutService.createPaymentForStripeOrder(order, orderRes.id).subscribe( res => {
          this.showConfirm = false;
          if(!res.error) {
            this.rechargeOrder = {
              type: 'recharge',
              license: uuid.v4(),
              createdBy: this.userPointer,
              isActive: true,
              data: orderRes,
              dataLoads: qty ? this.rechargeQuantityOffset * qty :this.rechargeQuantityOffset * this.fromIncrement,
              downloads: qty ? this.rechargeQuantityOffset * qty :this.rechargeQuantityOffset * this.fromIncrement,
              autoRecharge: this.doAutoRecharge,
              customerId: orderRes.customer,
              subscription: {
                objectId: this.order.subscription.objectId,
                className: 'Subscription',
                __type: 'Pointer'
              }
            }
            this.payoutService.storeOrder(this.rechargeOrder).subscribe(res => {
              this.orderIsLoading = false;
              this.orderSucceeded = true;

              if(this.modalService.hasOpenModals()) {
                this.autoRechargeModelRef.close();
              }
            }, err => {
              console.error(err);
            })
          }else {
            this.orderFailureMessage = res.error;
            this.orderSucceeded = false;
          }
          this.orderIsLoading = false;
        })
      }else{
        console.error(orderRes.error.message);
        this.orderIsLoading = false;
      }
    })
  }

  saveRechargeCard() {
    this.orderIsLoading = true;
    const cardHolder = this.billingForm.get('cardHolder').value;
    const street1 = this.billingForm.get('street1').value;
    const street2 = this.billingForm.get('street2').value;
    const city = this.billingForm.get('city').value;
    const state = this.billingForm.get('state').value ? this.billingForm.get('state').value : "";
    const country = this.billingForm.get('country').value;
    const zip = this.billingForm.get('zip').value;

    this.stripeService.createToken(this.card, {
        name: cardHolder,
        address_line1:street1,
        address_line2:street2,
        address_city:city,
        address_state: state,
        address_country: country,
        address_zip:zip}).subscribe( token => {
        if(token.error){
          this.success = false;
          this.isLoading = false;
          this.orderIsLoading = false;
          this.error = token.error.message;
          return;
        }
        const localToken = token.token as Token;
        const fullName: string[] = [];
        fullName.push(this.user.firstName);
        fullName.push(this.user.lastName);
        sessionStorage.setItem('token',JSON.stringify(localToken));
        if(this.billingForm.valid) {
          this.stripeService.createSource(this.card, {
            type: localToken.type,
            token: localToken.id,
            metadata:{},//this.userPointer,
            owner: {
              name: cardHolder.trim(),
              email: this.user.email,
              phone: this.user.phone,
              address: {
                line1: localToken.card.address_line1,
                line2: localToken.card.address_line2,
                city: localToken.card.address_city,
                state: localToken.card.address_state,
                country: localToken.card.address_country,
                postal_code: localToken.card.address_zip
              }
            }
          }).subscribe( source => {
            const localSource: StripeSource = source.source;
            const customerId: string = this.user.customerId;
            this.createOrRetrieveCustomer(customerId, localSource.id).subscribe( res => {
              let customer: StripeCustomer = res as StripeCustomer;

              this.payoutService.updateStripeCustomer({
                source:source.source.id
              }, customerId).subscribe(cRes =>{
                customer = cRes as StripeCustomer;
                if(!cRes.error){
                  this.payoutService.storeStripePayment({
                    isDefault: false,
                    customerId: customerId,
                    metaData: customer,
                    cardInfo: token.token.card.brand +':' + token.token.client_ip,
                    owner: this.userPointer,
                    title: token.token.card.brand,
                    isDebit: (token.token.card.funding.toLowerCase() === 'debit'),
                    isActive: (source.source.status.toLowerCase() === 'chargeable'),
                    description: token.token.card.last4,
                    type:'stripe-recharge-'+token.token.type
                  }).subscribe( res => {
                    this.orderIsLoading = false;
                    this.defaultSource = source.source;
                  }, err => {
                    console.error(err);
                    this.orderIsLoading = false;
                  });
                }
                this.orderIsLoading = false;
              },err=>{
                this.orderIsLoading = false;
              });
            });
          });
      }else{
        this.validateAllFormFields(this.billingForm);
        this.isLoading = false;
      }
    }, err => {
      console.error(err);
      this.orderIsLoading = false;
    });

  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  isFieldValid(field: string) {
    return !this.billingForm.get(field).valid && this.billingForm.get(field).touched;
  }

  displayFieldCss(field: string) {
    return {
      'is-invalid': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }

  rechargeConfirm() {
    this.showConfirm = true;
  }
  setIncludePhotos(value:boolean) {
    this.includePhotos = value;
  }
  autoRechargePlan(value:boolean) {
    this.doAutoRecharge = value;
  }

  public quantityUpdate(event){
    this.rechargeForm.get('quantity').patchValue(event.from);
  }

  public quantityChange(event){
    this.rechargeTotalPrice = this.fromIncrement * this.rechargePrice;
    this.rechargeTotal = this.fromIncrement * this.rechargeQuantityOffset;
    this.rechargeForm.get('quantity').patchValue(this.fromIncrement);
  }
  public quantityFinish(event){
    //console.log('durationFinish',event)
  }

  private handleAutoRecharge() {
    const toggleAutoRechargeWarning = localStorage.getItem("toggleAutoRechargeWarning") ?
      Number(localStorage.getItem("toggleAutoRechargeWarning")) : 0;
    if(toggleAutoRechargeWarning > 0 && (this.remainingDataLoads <= 0 || this.remainingDownloads <= 0)) {
      this.showAutoRecharge(this.autoRechargeContent);
    } else if(this.remainingDataLoads <= 0 || this.remainingDownloads <= 0) {
      this.doRecharge(1);
    }
  }

  getInterests(paper: Paper){
    let interests:string[] = [];
    for (let interest of paper.interests){
      interests.push(interest['name']);
    }
    return "Topics: " + interests.join(", ");
  }

  getLanguages(paper: Paper) {
    let languages:string[] = [];
    for (let language of paper.preferredLanguage){
      languages.push(language['name']);
    }
    return "Languages: " + languages.join(", ");
  }

  getNetworks(paper: Paper){
    let networks:string[] = [];
    for (let language of paper.networks){
      networks.push(language['name']);
    }
    return "Networks: " + networks.join(", ");
  }

  getKeywords(paper: Paper){
    let keywords:string[] = [];
    for (let keyword of paper.keywords){
      keywords.push(keyword['display']);
    }
    return "Keywords: " + keywords.join(", ");
  }

  getWebsites(paper: Paper){
    let websites:string[] = [];
    for (let web of paper.websites){
      websites.push(web['display']);
    }
    return "Websites: " + websites.join(", ");
  }

  getWebPages(paper: Paper){
    let webPages:string[] = [];
    for (let web of paper.webPages){
      webPages.push(web['display']);
    }
    return "URL's: " + webPages.join(", ");
  }


  getPeople(paper: Paper){
    let people:string[] = [];
    for (let p of paper.people){
      people.push(p['display']);
    }
    return "People: " + people.join(", ");
  }

  getOrganizations(paper: Paper){
    let orgs:string[] = [];
    for (let o of paper.organizations){
      orgs.push(o['display']);
    }
    return "Organizations: " + orgs.join(", ");
  }


  goUpgrade() {
    this.router.navigateByUrl('/settings');
  }

  onInputBlurred(event){

  }
  onInputFocused(event){

  }
  onSelected(event){

  }
  onItemRemoved(event){

  }
  onTextChange(event){

  }
  onItemAdded(event){

  }

}
