import { Favorite } from './../interfaces/favorite';

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonModal, NavController } from '@ionic/angular';
import {
  AddressDetails,
  GeoPoint,
  Itineraries,
  MTAGAPIService,
} from '../services/mtag-api.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FavoritesService } from '../services/favorites.service';

const select = 'selected';

@Component({
  selector: 'app-itineary-page',
  templateUrl: './itineary-page.page.html',
  styleUrls: ['./itineary-page.page.scss'],
})
export class ItinearyPagePage implements OnInit {
  currentItenary: Itineraries = {
    duration: 0,
    startTime: 0,
    endTime: 0,
    legs: [],
  };

  public navigationExtras: NavigationExtras = {
    queryParams: { itinerary: this.currentItenary },
  };

  constructor(
    public MtagService: MTAGAPIService,
    public favoritesService: FavoritesService,
    public navCtrl: NavController
  ) {
    this.navigationExtras = {
      queryParams: {
        itinerary: this.currentItenary,
      },
    };
  }

  fromSearch: string = 'gare de grenoble';
  toSearch: string = '2 rue colonel manhes';

  @ViewChild(IonModal) modal: any;

  fromSearchConfirmed: string = '';
  toSearchConfirmed: string = '';

  SearchResultsTab: AddressDetails[][] = [[], []];
  SearchLoading: boolean[] = [false, false];

  itinerarys: any[] = [];

  ItinaryLoading: boolean = false;

  public RouteColorTranslater: { [id: string]: string } = {
    '3376B8': '#3376B8',
  };

  favorites: Favorite[] = [];

  isFav = true;
  classSelectionFav = select;
  classSelectionRecent = '';

  isDepart = true;
  classSelectionDepart = select;
  classSelectionArrival = '';
  chosenDate = '';

  StartItineraryMarker: AddressDetails | undefined;

  EndItineraryMarker: AddressDetails | undefined;

  fav1: Favorite = {
    name: 'Quai Stéphane Jay, 38000 Grenoble',
    type: 'location',
    stationId: '',
    line: '',
    lat: 45.1970934,
    lon: 5.7217403,
  };

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  ngOnInit() {
    this.favorites = this.favoritesService.getFavoritesByType('location');
    this.favoritesService.addFavorite(this.fav1);
  }

  goToMap() {
    this.modal.dismiss(null, 'cancel');
    this.navCtrl.navigateForward('/tabs/tab1');
  }

  goToMapWithItinerary(itinerary: Itineraries) {
    this.modal.dismiss(null, 'cancel');
    this.navigationExtras = {
      queryParams: {
        itinerary: itinerary,
        start: this.StartItineraryMarker,
        end: this.EndItineraryMarker,
      },
    };
    this.navCtrl.navigateForward('/tabs/tab1', this.navigationExtras);
  }

  toggleQuickSearchFav() {
    this.classSelectionRecent = '';
    this.classSelectionFav = select;
    this.isFav = true;
  }

  toggleQuickSearchRecent() {
    this.classSelectionFav = '';
    this.classSelectionRecent = select;
    this.isFav = false;
  }

  toggleDepart() {
    this.classSelectionArrival = '';
    this.classSelectionDepart = select;
    this.isDepart = true;
  }

  toggleArrival() {
    this.classSelectionDepart = '';
    this.classSelectionArrival = select;
    this.isDepart = false;
  }

  favSelected(fav: Favorite) {
    console.log(fav);
  }

  searchBarFocused() {}

  onSearchChange(direction: number) {
    this.SearchResultsTab[direction] = [];
    if (direction == 0) {
      this.fromSearchConfirmed = '';
      document.getElementById('fromInput')!.style.color = 'red';
    } else if (direction == 1) {
      this.toSearchConfirmed = '';
      document.getElementById('toInput')!.style.color = 'red';
    }
  }

  changeSearch(direction: number, value: string) {
    console.log('direction : ' + direction + ' value : ' + value);
    this.SearchResultsTab[direction] = [];
    if (direction == 0) {
      this.fromSearch = value;
      this.fromSearchConfirmed = value;
      // get element with id fromInput and set text color to green
      document.getElementById('fromInput')!.style.color = 'white';
    } else if (direction == 1) {
      this.toSearch = value;
      this.toSearchConfirmed = value;
      document.getElementById('toInput')!.style.color = 'white';
    }
  }

  searchAutocomplete(event: any, direction: number) {
    const query = event.target.value.toLowerCase();
    this.SearchResultsTab[direction] = [];
    // console.log(query);
    if (query.length > 2) {
      if (
        (direction == 1 && this.toSearchConfirmed == '') ||
        (direction == 0 && this.fromSearchConfirmed == '')
      ) {
        this.SearchLoading[direction] = true;
        this.MtagService.searchAutocomplete(query).then((data: any) => {
          if (data == null) {
            let msgError: AddressDetails = {
              name: 'Aucun résultat',
              lat: 0,
              lon: 0,
            };
            this.SearchResultsTab[direction].push(msgError);
            this.SearchLoading[direction] = false;
          } else {
            this.SearchResultsTab[direction] = data;
            this.SearchLoading[direction] = false;
          }
        });
      }
    }
  }

  confirmItinerary() {
    if (this.fromSearchConfirmed != '' && this.toSearchConfirmed != '') {
      // this.navCtrl.navigateForward('/tabs/tab1');
      this.calcItenerary();
    } else {
      alert(
        "Veuillez sélectionner une station d'arrivée et une station de départ"
      );
    }
  }

  roundTime(num: number) {
    let tmp = Math.round(num);
    if (tmp >= 60) {
      let nutmp = Math.round(tmp / 60);
      return nutmp + 'h' + (tmp - nutmp * 60);
    }
    return tmp + 'min';
  }

  calcItenerary() {
    this.itinerarys = [];
    this.ItinaryLoading = true;
    this.MtagService.searchSimpleGeoCoding(this.fromSearchConfirmed).then(
      (data: any) => {
        let from = data;
        this.StartItineraryMarker = from;
        this.MtagService.searchSimpleGeoCoding(this.toSearchConfirmed).then(
          (data: any) => {
            let to = data;
            this.EndItineraryMarker = to;
            let date = new Date(this.chosenDate);
            if (this.chosenDate == '') {
              date = new Date();
            }
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let time = hours + ':' + minutes;
            console.log(time);

            // parse date in format YYYY-MM-DD
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let dateStr = year + '-' + month + '-' + day;
            console.log(dateStr);
            this.MtagService.calcItinerarys(
              from,
              to,
              !this.isDepart,
              time,
              dateStr
            ).then((data: any) => {
              this.ItinaryLoading = false;
              console.log(data);
              this.itinerarys = data;
              console.log(this.itinerarys);

              // sort itineraries by duration
              this.itinerarys.sort((a, b) => {
                return a.duration - b.duration;
              });
            });
          }
        );
      }
    );
  }

  showItenerarys() {}

  convertRouteColor(color: string) {
    return '#' + color;
  }

  convertTimestamp(timeStamp: number) {
    let date = new Date(timeStamp);
    let hours = date.getHours();
    let minutes = '0' + date.getMinutes();
    let seconds = '0' + date.getSeconds();
    return hours + ':' + minutes.substr(-2);
  }

  convertSecondsToMinutes(seconds: number) {
    let minutes = Math.floor(seconds / 60);
    let secondsLeft = seconds % 60;
    let result = '';
    if (minutes > 0) {
      result += minutes + ' min ';
    }
    if (secondsLeft > 0) {
      result += secondsLeft + ' secs';
    }
    return result;
  }
}
