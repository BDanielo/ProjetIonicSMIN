import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';

import { Favorite } from '../interfaces/favorite';

/*
Type of favorite:
- location
- TramStation
*/

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  public favorites: Array<Favorite> = [];

  constructor(public storageService: StorageService) {
    this.storageService.getFavorites().then((val) => {
      if (val) {
        console.log(val);
        this.favorites = val;
      }
    });
  }

  addFavorite(favorite: Favorite) {
    this.isFavorite(favorite) ? false : this.favorites.push(favorite);
    this.storageService.updateFavorite(this.favorites);
  }

  removeFavorite(favId: string, line: string) {
    this.favorites = this.favorites.filter(
      (f) => f.stationId !== favId || f.line !== line
    );
    this.storageService.updateFavorite(this.favorites);
  }

  removeFavoriteByName(name: string, type: string) {
    this.favorites = this.favorites.filter(
      (f) => f.name !== name || f.type !== type
    );
    this.storageService.updateFavorite(this.favorites);
  }

  // create a function to compare two favorite, and return true if they are the same
  compareFavorite(fav1: Favorite, fav2: Favorite) {
    if (
      fav1.type === fav2.type &&
      (fav1.stationId === fav2.stationId ||
        (fav1.lat === fav2.lat && fav1.lon === fav2.lon))
    ) {
      return true;
    } else {
      return false;
    }
  }

  // check if a favorite is already in the list, and return true if it is the case
  isFavorite(fav: Favorite) {
    return this.favorites.find((f) => this.compareFavorite(f, fav))
      ? true
      : false;
  }

  getFavorites() {
    return this.favorites;
  }

  getFavorite(name: string) {
    return this.favorites.find((f) => f.name === name);
  }

  getFavoriteByType(name: string) {
    return this.favorites.find((f) => f.name === name);
  }

  IdIsFavorite(favId: string, line: string) {
    return this.favorites.find((f) => f.stationId === favId && f.line === line)
      ? true
      : false;
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
