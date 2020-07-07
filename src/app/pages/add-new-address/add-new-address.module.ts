import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddNewAddressPageRoutingModule } from './add-new-address-routing.module';

import { AddNewAddressPage } from './add-new-address.page';
import { SharedModule } from 'src/app/directives/shared.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddNewAddressPageRoutingModule,
    SharedModule,
    GooglePlaceModule,
  ],
  declarations: [AddNewAddressPage]
})
export class AddNewAddressPageModule { }
