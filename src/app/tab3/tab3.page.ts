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
    this.sortItem()
  }

  ionViewWillEnter() {
    this.favorites = this.favoritesService.getFavorites();
    this.sortItem()
  }

  favChange() {
    this.favorites = this.favoritesService.getFavorites();
    this.sortItem()
  }

  sortItem(){
    //sort favorites by favorites.type and favorites.line
    this.favorites.sort((a, b) => {
      if (a.type > b.type) {
        return -1;
      } else if (a.type < b.type) {
        return 1;
      } else {
        if (a.line.length > b.line.length) {
          return 1;
        } else if (a.line.length < b.line.length) {
          return -1;
        } else {
          if (a.line > b.line) {
            return 1;
          } else if (a.line < b.line) {
            return -1;
          } else {
            return 0;
          }
        }
      }
    });
  }

}
