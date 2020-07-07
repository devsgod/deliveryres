import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { Router, NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import * as  moment from 'moment';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  haveItems: boolean = false;
  vid: any = '';
  foods: any;
  name: any;
  descritions: any;
  cover: any;
  address: any;
  time: any;
  totalPrice: any = 0;
  totalItem: any = 0;
  serviceTax: any = 0;
  deliveryCharge: any = 2.99;
  grandTotal: any = 0;
  deliveryAddress: any = '';
  totalRatting: any = 0;
  coupon: any;
  dicount: any;
  uid: any;
  delipickc: boolean=true;
  termAgree: boolean=false;
  cart: any[] = [];
  orderDate: any;
  orderTimeArray: any=["ASAP"];
  openTime: any;
  closeTime: any;
  constructor(
    private api: ApisService,
    private router: Router,
    private util: UtilService,
    private navCtrl: NavController,
    private chMod: ChangeDetectorRef
  ) {
    this.util.getCouponObservable().subscribe(data => {
      if (data) {
        console.log(data);
        this.coupon = data;
        console.log('coupon', this.coupon);
        console.log(this.totalPrice);0
        localStorage.setItem('coupon', JSON.stringify(data));
        // this.calculate();
      }
    });    
  }

  ngOnInit() {

  }
  getAddress() {
    const add = JSON.parse(localStorage.getItem('deliveryAddress'));
    if (add && add.address) {
      this.deliveryAddress = add.address;
    }
    return this.deliveryAddress;
  }
  getVenueDetails() {

    // Venue Details
    this.api.getVenueDetails(this.vid).then(data => {
      console.log(data);
      if (data) {
        this.name = data.name;
        this.descritions = data.descritions;
        this.cover = data.cover;
        this.address = data.address;
        this.time = data.time;
        this.totalRatting = data.totalRatting;
        this.deliveryCharge = data.deliveryCharge;
        this.openTime = data.openTime;
        this.closeTime = data.closeTime;
        localStorage.setItem("deliveryCharge", this.deliveryCharge);
        this.uid = data.uid;
        this.calculate();
        this.getQuaterDate();
      }
    }, error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  validate() {

    this.api.checkAuth().then(async (user) => {
      if (user) {
        const id = await localStorage.getItem('vid');
        console.log('id', id);
        if (id) {
          this.vid = id;
          this.getVenueDetails();
        console.log('id', id);
        // const foods = await localStorage.getItem('foods');
          // if (foods) {
          //   this.foods = await JSON.parse(foods);
          //   let recheck = await this.foods.filter(x => x.quantiy > 0);
          //   console.log('vid', this.vid);
          //   console.log('foods', this.foods);
          //   if (this.vid && this.foods && recheck.length > 0) {
          //     this.haveItems = true;
          //     this.calculate();
          //     this.chMod.detectChanges();
          //   }
          // }
          const cart = localStorage.getItem('userCart');
          try {
            if (cart && cart !== 'null' && cart !== undefined && cart !== 'undefined') {
              this.cart = JSON.parse(localStorage.getItem('userCart'));
              this.calculate();
            } else {
              this.cart = [];
            }
          } catch (error) {
            console.log(error);
            this.cart = [];
          }

          console.log('========================>', this.cart);
        } else {
          this.haveItems = false;
          this.cart=[];
          this.chMod.detectChanges();
        }
        this.chMod.detectChanges();
        return true;
      } else {
        this.router.navigate(['login']);
      }
    }).catch(error => {
      console.log(error);
    });
  }

  ionViewWillEnter() {
    this.validate();
  }
  getCart() {
    this.navCtrl.navigateRoot(['tabs/tab1']);
  }
  addQ(index) {
    this.cart[index].quantiy = this.cart[index].quantiy + 1;
    this.calculate();
  }
  removeQ(index) {
    if (this.cart[index].quantiy !== 0) {
      this.cart[index].quantiy = this.cart[index].quantiy - 1;
    } else {
      this.cart[index].quantiy = 0;
    }
    localStorage.setItem('userCart', JSON.stringify(this.foods));
    this.calculate();
  }

  addQAddos(i, j) {
    console.log(this.cart[i].selectedItem[j]);
    this.cart[i].selectedItem[j].total = this.cart[i].selectedItem[j].total + 1;
    this.calculate();
  }
  removeQAddos(i, j) {
    console.log(this.cart[i].selectedItem[j]);
    if (this.cart[i].selectedItem[j].total !== 0) {
      this.cart[i].selectedItem[j].total = this.cart[i].selectedItem[j].total - 1;
      if (this.cart[i].selectedItem[j].total === 0) {
        const newCart = [];
        this.cart[i].selectedItem.forEach(element => {
          if (element.total > 0) {
            newCart.push(element);
          }
        });
        console.log('newCart', newCart);
        this.cart[i].selectedItem = newCart;
        this.cart[i].quantiy = newCart.length;
      }
    }
    this.calculate();
  }

  /// NEW calc

  async calculate() {
    console.log(this.foods);
    console.log(this.deliveryCharge);
    // new
    let item = this.cart.filter(x => x.quantiy > 0);
    this.cart.forEach(element => {
      if (element.quantiy === 0) {
        element.selectedItem = [];
      }
    });
    console.log('item=====>>', item);
    this.totalPrice = 0;
    this.totalItem = 0;
    this.cart = [];
    console.log('cart emplth', this.cart, item);
    item.forEach(element => {
      this.totalItem = this.totalItem + element.quantiy;
      console.log('itemsss----->>>', element);
      if (element && element.selectedItem && element.selectedItem.length > 0) {
        let subPrice = 0;
        element.selectedItem.forEach(subItems => {
          subItems.item.forEach(realsItems => {
            subPrice = subPrice + (realsItems.value);
          });
          subPrice = subPrice * subItems.total;
        });
        this.totalPrice = this.totalPrice + subPrice;
      } else {
        this.totalPrice = this.totalPrice + (parseFloat(element.price) * parseInt(element.quantiy));
      }
      this.cart.push(element);
    });
    localStorage.removeItem('userCart');
    console.log('carrrrrrr---->>>', this.cart);
    localStorage.setItem('userCart', JSON.stringify(this.cart));
    this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
    // new

    console.log('total item', this.totalItem);
    console.log('=====>', this.totalPrice);
    const tax = (parseFloat(this.totalPrice) * 21) / 100;
    this.serviceTax = tax.toFixed(2);
    console.log('tax->', this.serviceTax);
    if (this.delipickc){
      this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
    } else {
      this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax);
    }
    this.grandTotal = this.grandTotal.toFixed(2);
    if (this.coupon && this.coupon.code && this.totalPrice >= this.coupon.min) {
      if (this.coupon.type === '%') {
        console.log('per');
        function percentage(num, per) {
          return (num / 100) * per;
        }
        const totalPrice = percentage(parseFloat(this.totalPrice).toFixed(2), this.coupon.discout);
        console.log('============>>>>>>>>>>>>>>>', totalPrice);
        this.dicount = totalPrice.toFixed(2);
        this.totalPrice = parseFloat(this.totalPrice) - totalPrice;
        // this.totalPrice = totalPrice;
        console.log('------------>>>>', this.totalPrice);
        this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
        const tax = (parseFloat(this.totalPrice) * 21) / 100;
        this.serviceTax = tax.toFixed(2);
        console.log('tax->', this.serviceTax);
        if (this.delipickc){
          this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
        } else {
          this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax);
        }
        this.grandTotal = this.grandTotal.toFixed(2);
      } else {
        console.log('curreny');
        const totalPrice = parseFloat(this.totalPrice) - this.coupon.discout;
        console.log('============>>>>>>>>>>>>>>>', totalPrice);
        this.dicount = this.coupon.discout;
        this.totalPrice = totalPrice;
        console.log('------------>>>>', this.totalPrice);
        this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
        const tax = (parseFloat(this.totalPrice) * 21) / 100;
        this.serviceTax = tax.toFixed(2);
        console.log('tax->', this.serviceTax);
        if (this.delipickc){
          this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
        } else {
          this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax);
        }
        this.grandTotal = this.grandTotal.toFixed(2);
      }
    } else {
      console.log('not satisfied');
      this.coupon = null;
      localStorage.removeItem('coupon');
    }
    console.log('grand total', this.grandTotal);
    if (this.totalItem === 0) {
      const lng = localStorage.getItem('language');
      const selectedCity = localStorage.getItem('selectedCity');
      await localStorage.clear();
      localStorage.setItem('language', lng);
      localStorage.setItem('selectedCity', selectedCity);
      this.totalItem = 0;
      this.totalPrice = 0;
      this.haveItems = false;
    }
  }
  // NEW calc

  getCurrency() {
    return this.util.getCurrecySymbol();
  }

  changeAddress() {
    const navData: NavigationExtras = {
      queryParams: {
        from: 'cart'
      }
    };
    this.router.navigate(['choose-address'], navData);
  }
  checkout() {
    if (this.orderDate == null || this.orderDate == ""){
      alert("Please select your order time.")
      return false;
    }
    console.log('check', this.grandTotal < 0)
    if (this.grandTotal < 0) {
      this.util.errorToast(this.util.translate('Something went wrong'));
      return false;
    }
    const navData: NavigationExtras = {
      queryParams: {
        from: 'cart'
      }
    };

    if (this.delipickc){
      this.router.navigate(['choose-address'], navData);
    } else {
      this.router.navigate(['payments']);
    }
  }
  openCoupon() {
    const navData: NavigationExtras = {
      queryParams: {
        restId: this.vid,
        name: this.name,
        totalPrice: this.totalPrice
      }
    };
    this.router.navigate(['coupons'], navData);
  }
  addMoreFood(){
    const navData: NavigationExtras = {
      queryParams: {
        id: this.uid
      }
    };
    this.navCtrl.navigateRoot(['category'], navData);
  }

  deliPickC(){
    console.log(this.delipickc);
    if (this.delipickc){
      localStorage.setItem('orderType',"delivery");
      this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
    } else {
      localStorage.setItem('orderType',"pickup");
      this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax);
    }
    this.grandTotal = this.grandTotal.toFixed(2);
  }

  goTerms(){

  }
  
  goPolicies(){

  }

  getQuaterDate() {
    var openHour = this.openTime.split(":")[0];
    var closeHour = this.closeTime.split(":")[0];
    var openMinute = this.openTime.split(":")[1];
    var closeMinute = this.closeTime.split(":")[1];

    var currentDate = new Date(),
        currentQuaterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours()+1, (currentDate.getMinutes() - (currentDate.getMinutes() % 15)), 0, 0);
    if (currentQuaterDate.getMinutes() == 60){
      currentQuaterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours()+1, 0, 0, 0);
    }
    var openTimeWhole = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), openHour, openMinute, currentDate.getSeconds(), 0);
    var closeTimeWhole = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), closeHour, closeMinute, currentDate.getSeconds(), 0);
    var quarterHours = ["00", "15", "30", "45"];
    var time;
    if (currentQuaterDate.getHours() == openHour && openMinute < currentQuaterDate.getMinutes()){
      var min = currentQuaterDate.getMinutes();
      while(min < 60){
        if (min == 0){
          time = currentQuaterDate.getHours() + ":" + "00";
        } else {
          time = currentQuaterDate.getHours() + ":" + min;
        }        
        this.orderTimeArray.push(time);
        min = min + 15;
      }
    }
    if (currentQuaterDate.getHours() < closeHour){    
      var min = currentQuaterDate.getMinutes();
      while(min < 60){
        if (min == 0){
          time = currentQuaterDate.getHours() + ":" + "00";
        } else {
          time = currentQuaterDate.getHours() + ":" + min;
        }
        this.orderTimeArray.push(time);
        min = min + 15;
      }
      console.log("ok");
      for(var i=currentDate.getHours()+2  ; i<closeHour;i++){
        for (var j=0;j<4;j++){
          time = i + ":" + quarterHours[j];
          if(i<10){
            time = "0" + time;
          }
          this.orderTimeArray.push(time);
        }
      }
    }
    if (currentQuaterDate.getHours() == closeHour && closeMinute > currentQuaterDate.getMinutes()){
      var min = currentQuaterDate.getMinutes();
      console.log(min)
      while(min < closeMinute){
        if (min == 0){
          time = currentQuaterDate.getHours() + ":" + "00";
        } else {
          time = currentQuaterDate.getHours() + ":" + min;
        }
        this.orderTimeArray.push(time);
        min = min + 15;
      }
    }
    localStorage.setItem('orderDate',this.orderDate);
    console.log(this.orderTimeArray);
  }

  getOrderTime(item){
    var currentDate = new Date();
    if (item != "ASAP"){
      this.orderDate=new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), item.split(':')[0], item.split(':')[1], 0, 0);
    } else {
      this.orderDate = "ASAP";
    }
    localStorage.setItem('orderDate',this.orderDate);
  }
}