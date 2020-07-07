import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CategoryPage } from './category.page';
import { UserGuard } from 'src/app/UserGuard/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: CategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryPageRoutingModule {}
