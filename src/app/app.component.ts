import { FavoritesService } from './services/favorites.service';
import { Component } from '@angular/core';
import { MTAGAPIService } from './services/mtag-api.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    public storageService: StorageService,
    public favoritesService: FavoritesService,
    public mtagService: MTAGAPIService
    ) {}
}
