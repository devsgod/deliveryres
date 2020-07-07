import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { Router, NavigationExtras } from '@angular/router';
import * as moment from 'moment';
import { AngularFirestore } from 'angularfire2/firestore';
@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  haveItems: boolean = false;
  myOrders: any[] = [];
  dummy = Array(50);

  seg_id = 1;

  newOrders: any[] = [];
  onGoingOrders: any[] = [];
  oldOrders: any[] = [];
  constructor(
    private api: ApisService,
    private util: UtilService,
    private router: Router,
    private adb: AngularFirestore
  ) {
    // if (localStorage.getItem('uid')) {
    //   this.adb.collection('orders', ref => ref.where('userId', '==', localStorage.getItem('uid'))).snapshotChanges().subscribe(data => {
    //     if (data) {
    //       this.getMyOrders();
    //     }
    //   });
    // }
    this.util.subscribeLoggedIn().subscribe(data => {
      this.getMyOrders();
    });
  }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    await this.validate();
  }

  getMyOrders() {
    this.api.getMyOrders(localStorage.getItem('uid')).then((data: any) => {
      console.log('my orders', data);
      if (data && data.length) {
        this.haveItems = true;
        data.forEach(element => {
          element.time = new Date(element.time);
        });
        data.sort((a, b) => b.time - a.time);
        this.myOrders = data;
        this.myOrders.forEach(element => {
          element.order = JSON.parse(element.order);
          if (element.orderTime == "ASAP"){
            // element.orderTime
          }
          if (element.status === 'created') {
            this.newOrders.push(element);
          } else if (element.status === 'accepted' || element.status === 'ongoing') {
            this.onGoingOrders.push(element);
          } else if (element.status === 'delivered' || element.status === 'cancel' || element.status === 'rejected') {
            this.oldOrders.push(element);
          }
        });
        console.log('my order==>', this.myOrders);
        console.log('new order==>', this.newOrders);
        console.log('on order==>', this.onGoingOrders);
        console.log('old order==>', this.oldOrders);
        this.newOrders.sort((a, b) => b.time - a.time);
        this.onGoingOrders.sort((a, b) => b.time - a.time);
        this.oldOrders.sort((a, b) => b.time - a.time);
      }
      this.dummy = [];
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }
  validate() {
    this.api.checkAuth().then(async (user: any) => {
      if (user) {
        localStorage.setItem('uid', user.uid);
        this.getMyOrders();
      } else {
        this.router.navigate(['login']);
      }
    }).catch(error => {
      console.log(error);
    });
  }
  getCart() {
    this.router.navigate(['/tabs']);
  }
  goToHistoryDetail(orderId) {
    const navData: NavigationExtras = {
      queryParams: {
        id: orderId
      }
    };
    this.router.navigate(['/history-detail'], navData);
  }
  getDate(date) {
    return moment(date).format('llll');
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }

  onClick(val) {
    this.seg_id = val;
  }

}
