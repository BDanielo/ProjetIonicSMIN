import { Injectable } from '@angular/core';

export interface Favorite {
  name: string;
  type: string; //TramStation or Custom
  stationid: string;
  lat: number;
  lon: number;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  public favorites: Favorite[] = [];

  constructor() {}

  addFavorite(favorite: Favorite) {
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
    return this.favorites.filter((f) => f.stationid === stationid);
  }

  getFavoritesByPosition(lat: number, lon: number) {
    return this.favorites.filter((f) => f.lat === lat && f.lon === lon);
  }
}
