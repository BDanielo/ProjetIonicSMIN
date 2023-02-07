import { FavoritesService } from './services/favorites.service';
import { Component } from '@angular/core';
import { MTAGAPIService } from './services/mtag-api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    public favoritesService: FavoritesService,
    public mtagService: MTAGAPIService 
    ) {}
}
