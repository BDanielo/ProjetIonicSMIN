import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Favorite } from '../interfaces/favorite';

const store = new Storage({
  name: 'favoritesBDD',
  storeName: 'favorites',
});


@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  public favorites: Array<Favorite> = [];

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
    this.favorites.push(favorite);
    store.set('favorites', this.favorites);
  }

  removeFavorite(favId: string, line: string) {
    this.favorites = this.favorites.filter((f) => f.stationId !== favId || f.line !== line);
    store.set('favorites', this.favorites);
  }

  getFavorites() {
    return this.favorites;
  }

  getFavorite(name: string) {
    return this.favorites.find((f) => f.name === name);
  }

  IdIsFavorite(favId: string, line:string) {
    return this.favorites.find((f) => f.stationId === favId && f.line === line) ? true : false;
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
