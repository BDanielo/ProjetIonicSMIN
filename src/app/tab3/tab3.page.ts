import { Component } from '@angular/core';
import { Favorite } from '../interfaces/favorite';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  favorites: Array<Favorite> = [];

  constructor(public favoritesService: FavoritesService) {}

  ngOnInit() {
    this.favorites = this.favoritesService.getFavorites();
  }

  ionViewWillEnter() {
    this.favorites = this.favoritesService.getFavorites();
  }

  favChange() {
    this.favorites = this.favoritesService.getFavorites();
  }

}
