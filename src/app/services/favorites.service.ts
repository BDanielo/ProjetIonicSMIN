import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Favorite } from '../interfaces/favorite';

const store = new Storage();


@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  public favorites: Favorite[] = [];

  constructor() {
    store.create().then(() => {
      store.get('favorites').then((val) => {
        if (val) {
          this.favorites = val;
        }
      });
    });
  }

  addFavorite(favorite: Favorite) {
    store.set('favorites', favorite);
    this.favorites.push(favorite);
  }

  removeFavorite(favorite: Favorite) {
    this.favorites = this.favorites.filter((f) => f !== favorite);
  }

  getFavorites() {
    return this.favorites;
  }

  getFavorite(name: string) {
    return this.favorites.find((f) => f.name === name);
  }

  NameisFavorite(name: string) {
    return this.favorites.find((f) => f.name === name) ? true : false;
  }

  PositionIsFavorite(lat: number, lon: number) {
    return this.favorites.find((f) => f.lat === lat && f.lon === lon)
      ? true
      : false;
  }

  getFavoritesByType(type: string) {
    return this.favorites.filter((f) => f.type === type);
  }

  getFavoritesByStationId(stationid: string) {
    return this.favorites.filter((f) => f.stationId === stationid);
  }

  getFavoritesByPosition(lat: number, lon: number) {
    return this.favorites.filter((f) => f.lat === lat && f.lon === lon);
  }
}
