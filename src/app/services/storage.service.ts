import { Favorite } from './../interfaces/favorite';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

const store = new Storage({
  name: 'localStorage',
  storeName: 'favorites',
});

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { 
    store.create();
  }

  getFavorites(): Promise<Favorite[]> {
    return store.get('favorites').then((val) => {
      if (val) {
        return val;
      }
    });
  }

  getRecent(): Promise<Favorite[]> {
    return store.get('recent').then((val) => {
      if (val) {
        return val;
      }
    });
  }

  updateFavorite(favorites: Favorite[]) {
    store.set('favorites', favorites);
  }

  updateRecent(recent: Favorite[]) {
    store.set('recent', recent);
  }
}
