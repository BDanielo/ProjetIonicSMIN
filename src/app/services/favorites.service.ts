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

  constructor(
    public storageService: StorageService,
  ) {
    this.storageService.getFavorites().then((val) => {
      if (val) {
        console.log(val);
        this.favorites = val;
      }
    });
  }
  
  addFavorite(favorite: Favorite) {
    this.favorites.push(favorite);
    this.storageService.updateFavorite(this.favorites);
  }

  removeFavorite(favId: string, line: string) {
    this.favorites = this.favorites.filter((f) => f.stationId !== favId || f.line !== line);
    this.storageService.updateFavorite(this.favorites);
  }

  removeFavoriteByName(name: string, type: string) {
    this.favorites = this.favorites.filter((f) => f.name !== name || f.type !== type);
    this.storageService.updateFavorite(this.favorites);
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
