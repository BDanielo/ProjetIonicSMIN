import { Favorite } from './../interfaces/favorite';
import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { MTAGAPIService } from '../services/mtag-api.service';
import { FavoritesService } from '../services/favorites.service';

const select = "selected"
@Component({
  selector: 'app-itineary-page',
  templateUrl: './itineary-page.page.html',
  styleUrls: ['./itineary-page.page.scss'],
})
export class ItinearyPagePage implements OnInit {


  constructor(
    public MtagService: MTAGAPIService,
    public favoritesService: FavoritesService,
    public navCtrl: NavController
  ) { }

  favorites: Favorite [] = [];
  
  isFav = true;
  classSelectionFav = select;
  classSelectionRecent = "";

  isDepart = true;
  classSelectionDepart = select;
  classSelectionArrival = "";
  chosenDate = ""

  // fav1: Favorite = {
  //   name: "Quai Stéphane Jay, 38000 Grenoble",
  //   type: "location",
  //   stationId: "",
  //   line: "",
  //   lat: 45.1970934,
  //   lon: 5.7217403,
  // }

  // fav2: Favorite = {
  //   name: "1 Pl. de la Gare, 38000 Grenoble",
  //   type: "location",
  //   stationId: "",
  //   line: "",
  //   lat: 45.1911984,
  //   lon: 5.7137839,
  // }

  // fav3: Favorite = {
  //   name: "17 Quai Claude Bernard, 38000 Grenoble",
  //   type: "location",
  //   stationId: "",
  //   line: "",
  //   lat: 45.1911455,
  //   lon: 5.7146315,
  // }

  // fav4: Favorite = {
  //   name: "Pl. Hubert Dubedout, 38000 Grenoble",
  //   type: "location",
  //   stationId: "",
  //   line: "",
  //   lat: 45.1936,
  //   lon: 5.7207991,
  // }


  
  ngOnInit() {
    this.favorites = this.favoritesService.getFavoritesByType("location");
  }

  goToMap() {
    this.navCtrl.navigateForward('/tabs/tab1');
  }

  toggleQuickSearchFav(){
      this.classSelectionRecent = "";
      this.classSelectionFav = select;
      this.isFav = true;
  }

  toggleQuickSearchRecent(){
    this.classSelectionFav = "";
    this.classSelectionRecent = select;
    this.isFav = false;
  }

  toggleDepart(){
    this.classSelectionArrival = "";
    this.classSelectionDepart = select;
    this.isDepart = true;
}

toggleArrival(){
  this.classSelectionDepart = "";
  this.classSelectionArrival = select;
  this.isDepart = false;
}

  search() {
    console.log(this.chosenDate);
  }

  favSelected(fav: Favorite) {
    console.log(fav);
  }

  searchBarFocused(){
  }

}
