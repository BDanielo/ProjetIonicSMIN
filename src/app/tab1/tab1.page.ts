import { Component, ViewChild } from '@angular/core';

// import leaflet routing machine
import * as leaflet from 'leaflet';
import 'leaflet-routing-machine';
//import 'leaflet-control-geocoder';
import { Geolocation, Position } from '@capacitor/geolocation';
import {
  AddressDetails,
  GeoPoint,
  MTAGAPIService,
  leg,
  Itineraries,
} from '../services/mtag-api.service';
import { TramStation } from '../interfaces/tram-station';
import { TramLine } from '../interfaces/tram-line';
import { LineSchedule } from '../interfaces/line-schedule';
import { StationsOfLine } from '../interfaces/stations-of-line';

import 'polyline-encoded';
import { IonModal, NavController } from '@ionic/angular';
import { FavoritesService } from '../services/favorites.service';
import { ActivatedRoute, Router } from '@angular/router';

declare var L: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  map: L.Map | undefined;

  lignesTram: TramLine[] = [];

  TramLineLayer: any;
  ItinerarieLayer: any;
  TramStationLayer: any;

  localisationMarker: any;

  markerSearch: any;
  markerSearchFav: boolean = false;
  markerSearchInfo: AddressDetails = {} as AddressDetails;

  fromSearch: string = 'gare de grenoble';
  toSearch: string = '33 avenue aristide briand';

  polylineWidth = 5;

  fromSearchConfirmed: string = '';
  toSearchConfirmed: string = '';

  SearchResultsTab: AddressDetails[][] = [[], []];

  SearchResults: AddressDetails[] = [];
  SearchResultsFrom: AddressDetails[] = [];
  SearchResultsTo: AddressDetails[] = [];

  ItinerarieStartMarker: any | undefined;
  ItinerarieEndMarker: any | undefined;

  ItinerarieStart: AddressDetails | undefined;
  ItinerarieEnd: AddressDetails | undefined;

  currentItenary: Itineraries = {
    duration: 0,
    startTime: 0,
    endTime: 0,
    legs: [],
  };

  ItineraryLayerState: boolean = false;

  @ViewChild(IonModal) modal: any;

  constructor(
    public MtagService: MTAGAPIService,
    public navCtrl: NavController,
    public favoritesService: FavoritesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe((params) => {
      // check if the url contain a intinerary
      if (params['itinerary']) {
        if (params['itinerary'].legs != undefined) {
          this.currentItenary = params['itinerary'];
          this.ItinerarieStart = params['start'];
          this.ItinerarieEnd = params['end'];
        } else {
          this.currentItenary = {
            duration: 0,
            startTime: 0,
            endTime: 0,
            legs: [],
          };
        }

        // check if map is loaded
        if (this.map) {
          this.drawItinerary();
        }
      }
    });
  }

  //constructor() {}asdaw

  ionViewDidEnter() {
    // set leaflet images path
    leaflet.Icon.Default.imagePath = '/assets/images/leaflet/';

    // create map
    if (this.map == undefined) {
      this.map = leaflet
        .map('map', { zoomControl: false })
        .setView([45.19270700749426, 5.718059703818313], 20);
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
        })
        .addTo(this.map);
      this.map.attributionControl.setPrefix(false);
    }

    // add tram line layer
    // if tram line layer is not already added
    if (this.TramLineLayer == undefined) {
      this.TramLineLayer = L.layerGroup().addTo(this.map);
    }

    if (this.ItinerarieLayer == undefined) {
      this.ItinerarieLayer = L.layerGroup().addTo(this.map);
    }

    if (this.TramStationLayer == undefined) {
      this.TramStationLayer = L.layerGroup().addTo(this.map);
    }

    this.markLines();

    if (this.currentItenary.legs.length > 0) {
      this.drawItinerary();
    } else {
      // get localisation
      this.getLocation().then((position: any) => {
        this.MtagService.getClosestStation(position).then((station) => {});
      });
    }
  }

  // the function creates colorful svg
  colorMarker(color: string, type: boolean = false) {
    let svgTemplate = ``;
    if (type) {
      svgTemplate = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="25" fill="${color}"/></svg>`;
    } else {
      svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="marker">
      <path fill-opacity=".25" d="M16 32s1.427-9.585 3.761-12.025c4.595-4.805 8.685-.99 8.685-.99s4.044 3.964-.526 8.743C25.514 30.245 16 32 16 32z"/>
      <path stroke="#fff" fill="${color}" d="M15.938 32S6 17.938 6 11.938C6 .125 15.938 0 15.938 0S26 .125 26 11.875C26 18.062 15.938 32 15.938 32zM16 6a4 4 0 100 8 4 4 0 000-8z"/>
    </svg>`;
    }

    const icon = L.divIcon({
      className: 'marker',
      html: svgTemplate,
      iconSize: [40, 40],
      iconAnchor: [12, 24],
      popupAnchor: [7, -16],
    });

    return icon;
  }

  // create a marker with a blue circle
  createMarker(lat: number, lon: number, popup: string, type: boolean = false) {
    const marker = L.marker([lat, lon], {
      icon: this.colorMarker('#0000ff', type),
    }).addTo(this.map!);
    marker.bindPopup(popup);
    return marker;
  }

  getLocation(): Promise<GeoPoint> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition()
        .then((position: any) => {
          let tmpGeoPoint: GeoPoint = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          resolve(tmpGeoPoint);
          // set map localisation
          this.map?.setView(
            [position.coords.latitude, position.coords.longitude],
            20
          );
          // remove old marker
          if (this.localisationMarker) {
            this.localisationMarker.remove();
          }

          this.localisationMarker = L.marker(
            [position.coords.latitude, position.coords.longitude],
            {
              icon: this.colorMarker('#0000ff', true),
            }
          ).addTo(this.map!);
          this.localisationMarker.bindPopup('Vous êtes ici');
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  setItenararyLayer() {
    this.ItineraryLayerState = true;
    this.ItinerarieLayer.addTo(this.map!);
  }

  removeIteneraryLayer() {
    this.ItineraryLayerState = false;
    this.ItinerarieLayer.remove();
    // remove start and end markers
  }

  clearIteneraryLayer() {
    this.ItinerarieLayer.clearLayers();

    if (this.ItinerarieStartMarker != undefined) {
      this.map!.removeLayer(this.ItinerarieStartMarker);
    }
    if (this.ItinerarieEndMarker != undefined) {
      this.map!.removeLayer(this.ItinerarieEndMarker);
    }
  }

  compareAdresseDetails(a: AddressDetails, b: AddressDetails) {
    return a.lat == b.lat && a.lon == b.lon;
  }

  getItinerarie(from: AddressDetails, to: AddressDetails) {
    // check if itinerarie already displayed
    if (this.ItinerarieStart != undefined || this.ItinerarieEnd != undefined) {
      if (
        this.compareAdresseDetails(from, this.ItinerarieStart!) &&
        this.compareAdresseDetails(to, this.ItinerarieEnd!) &&
        this.ItineraryLayerState
      ) {
        alert('Itineraire déjà affiché');
        return;
      }
    }

    // remove all other layers (tram line, stations) and clear initerarie layer
    this.map!.removeLayer(this.TramLineLayer);
    this.map!.removeLayer(this.TramStationLayer);

    // clear itinerarie layer
    this.clearIteneraryLayer();

    // add itinerarie layer
    this.setItenararyLayer();

    // save from and to points
    this.ItinerarieStart = from;
    this.ItinerarieEnd = to;

    this.MtagService.calcItinerary(from, to, false, '', '').then(
      (data: any) => {
        data.legs.forEach((leg: leg) => {
          var polyline = L.Polyline.fromEncoded(leg.legGeometry.points);

          if (leg.mode == 'WALK') {
            polyline.setStyle({ color: 'red' });
          } else {
            polyline.setStyle({ color: '#' + leg.routeColor });
          }
          polyline.setStyle({ weight: this.polylineWidth });

          this.ItinerarieLayer.addLayer(polyline);

          // add start and end markers
          this.ItinerarieStartMarker = L.marker([from.lat, from.lon]).addTo(
            this.map!
          );
          this.ItinerarieStartMarker.bindPopup('Départ : ' + from.name);

          this.ItinerarieEndMarker = L.marker([to.lat, to.lon]).addTo(
            this.map!
          );
          this.ItinerarieEndMarker.bindPopup('Arrivée : ' + to.name);

          // set map view to start marker
          this.map!.setView([from.lat, from.lon], 20);
        });
      }
    );
  }

  getItinerarieFromSearch(from: string, to: string) {
    this.MtagService.searchGeocoding(from).then((data: any) => {
      let from: AddressDetails = {
        name: data.name,
        lat: data.lat,
        lon: data.lon,
      };
      this.MtagService.searchGeocoding(to).then((data: any) => {
        let to: AddressDetails = {
          name: data.name,
          lat: data.lat,
          lon: data.lon,
        };
        this.getItinerarie(from, to);
      });
    });
  }

  getItinerarieFromSimpleSearch(from: string, to: string) {
    if (this.toSearchConfirmed != '' && this.fromSearchConfirmed != '') {
      this.MtagService.searchSimpleGeoCoding(from).then((data: any) => {
        let from: AddressDetails = {
          name: data.name,
          lat: data.lat,
          lon: data.lon,
        };
        this.MtagService.searchSimpleGeoCoding(to).then((data: any) => {
          let to: AddressDetails = {
            name: data.name,
            lat: data.lat,
            lon: data.lon,
          };
          this.getItinerarie(from, to);
        });
      });
    } else {
      alert('Veuillez entrer des adresses valides');
    }
  }

  drawItinerary() {
    console.log(this.currentItenary);
    // remove all other layers (tram line, stations) and clear initerarie layer
    this.map!.removeLayer(this.TramLineLayer);
    this.map!.removeLayer(this.TramStationLayer);

    // clear itinerarie layer
    this.clearIteneraryLayer();

    // add itinerarie layer
    this.setItenararyLayer();

    if (this.currentItenary != undefined) {
      this.currentItenary.legs.forEach((leg: leg) => {
        // create a polyline from a decoded traject geometry
        var polyline = L.Polyline.fromEncoded(leg.legGeometry.points);

        //check traject type
        if (leg.mode == 'WALK') {
          polyline.setStyle({ color: 'red' });
        } else {
          polyline.setStyle({ color: '#' + leg.routeColor });
        }
        polyline.setStyle({ weight: this.polylineWidth });

        this.ItinerarieLayer.addLayer(polyline);

        // remove start and end markers
        if (this.ItinerarieStartMarker != undefined) {
          this.map!.removeLayer(this.ItinerarieStartMarker);
        }
        if (this.ItinerarieEndMarker != undefined) {
          this.map!.removeLayer(this.ItinerarieEndMarker);
        }

        // add start and end markers
        this.ItinerarieStartMarker = L.marker(
          [this.ItinerarieStart!.lat, this.ItinerarieStart!.lon],
          {
            icon: this.colorMarker('#ff0000'),
          }
        ).addTo(this.map!);
        this.ItinerarieStartMarker.bindPopup(
          'Départ : ' + this.ItinerarieStart!.name
        );

        this.ItinerarieEndMarker = L.marker(
          [this.ItinerarieEnd!.lat, this.ItinerarieEnd!.lon],
          {
            icon: this.colorMarker('#0000ff'),
          }
        ).addTo(this.map!);
        this.ItinerarieEndMarker.bindPopup(
          'Arrivée : ' + this.ItinerarieEnd!.name
        );

        // set map view to start marker
        this.map!.setView(
          [this.ItinerarieStart!.lat, this.ItinerarieStart!.lon],
          20
        );
      });
    }
  }

  // get tram lines add them to a layer and add the layer to the map
  markLines() {
    return new Promise((resolve, reject) => {
      if (this.ItinerarieStartMarker != undefined) {
        this.map!.removeLayer(this.ItinerarieStartMarker);
      }
      if (this.ItinerarieEndMarker != undefined) {
        this.map!.removeLayer(this.ItinerarieEndMarker);
      }

      this.map!.removeLayer(this.ItinerarieLayer);
      this.map!.removeLayer(this.TramStationLayer);
      this.TramLineLayer = L.layerGroup().addTo(this.map);
      this.MtagService.getTramLines().then((data: any) => {
        this.lignesTram = data;
        this.lignesTram.forEach((ligne: TramLine) => {
          this.MtagService.getLinesPolyline(ligne.id).then((data: any) => {
            let LineGeoPoints = data.features[0].properties.shape[0];
            var polyline = L.Polyline.fromEncoded(LineGeoPoints);
            polyline.setStyle({ color: '#' + ligne.color });
            polyline.setStyle({ weight: this.polylineWidth });
            this.TramLineLayer.addLayer(polyline);

            // if last element
            if (this.lignesTram[this.lignesTram.length - 1] == ligne) {
              resolve('done');
            }
          });
        });
      });
    });
  }

  // get all tram stations and add them to a layer and add the layer to the map
  markStations() {
    this.markLines().then(() => {
      this.TramStationLayer = L.layerGroup().addTo(this.map);
      this.MtagService.getAllTramStations().then((data: any) => {
        data.forEach((line: StationsOfLine) => {
          line.TramStation.forEach((station: TramStation) => {
            const marker = L.marker([station.lat, station.lon]).addTo(
              this.map!
            );
            marker.bindPopup(station.name);
            this.TramStationLayer.addLayer(marker);
          });
        });
      });
    });
  }

  searchAutocomplete(event: any, direction: number) {
    const query = event.target.value.toLowerCase();
    this.SearchResultsTab[direction] = [];
    if (query.length > 2) {
      this.MtagService.searchAutocomplete(query).then((data: any) => {
        if (data == null) {
          alert('Adresse introuvable');
        } else {
          this.SearchResultsTab[direction] = data;
        }
      });
    }
  }

  changeSearch(direction: number, value: string) {
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

  toggleMarkerSearchFav() {
    //alert('toggleMarkerSearchFav');
    this.markerSearchFav = !this.markerSearchFav;
    if (this.markerSearchFav) {
      this.favoritesService.addFavorite({
        name: this.markerSearchInfo.name,
        type: 'location',
        stationId: '',
        line: '',
        lat: this.markerSearchInfo.lat,
        lon: this.markerSearchInfo.lon,
      });
    } else {
      this.favoritesService.removeFavoriteByName(
        this.markerSearchInfo.name,
        'location'
      );
    }
  }

  search(lat: number, lon: number) {
    this.SearchResultsTab[0] = [];
    this.MtagService.reverseGeoCoding(lat, lon).then((data: any) => {
      this.SearchResults = data;
      if (this.markerSearch) this.map?.removeLayer(this.markerSearch);
      this.markerSearch = L.marker([data.lat, data.lon]).addTo(this.map!);

      this.markerSearchInfo = data;

      let buttonAller = `<ion-button
        (click)="search('test')"
        >-> Aller vers</ion-button>`;

      let buttonFav = `<button *ngIf="markerSearchFav" onclick="toggleMarkerSearchFav()"><ion-icon name="heart"></ion-icon></button>`;

      this.markerSearchFav = this.favoritesService.isFavorite({
        name: data.name,
        stationId: '',
        line: '',
        type: 'location',
        lat: data.lat,
        lon: data.lon,
      });

      let popupContent =
        '<p>' + data.name + '</p><div id="popupMarkSearch"></div>';
      this.markerSearch.bindPopup(popupContent);
      this.map?.setView([data.lat, data.lon], 20);
      this.markerSearch.openPopup();

      this.markerSearch.on('popupclose', () => {
        let btns = document.getElementById('btnFavMarker');
        document.querySelector('ion-content')!.append(btns!);
      });

      this.markerSearch.on('popupopen', () => {
        this.markerSearchFav = this.favoritesService.isFavorite({
          name: data.name,
          stationId: '',
          line: '',
          type: 'location',
          lat: data.lat,
          lon: data.lon,
        });

        let popupelement = document.getElementById('popupMarkSearch');
        let btns = document.getElementById('btnFavMarker');

        if (btns) popupelement?.appendChild(btns);
      });
      // btnFavMarker

      let popupelement = document.getElementById('popupMarkSearch');
      let btns = document.getElementById('btnFavMarker');

      if (btns) popupelement?.appendChild(btns);
    });
  }

  goToItineary() {
    this.exitModal();
    this.navCtrl.navigateForward('/itineary-page');
  }

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

  exitModal() {
    this.modal.dismiss();
  }

  deleteItinerary() {
    this.currentItenary = {
      duration: 0,
      startTime: 0,
      endTime: 0,
      legs: [],
    };
    this.ItineraryLayerState = false;
    this.markLines();
    this.exitModal();
  }

  deleteAndAddItinerary() {
    this.deleteItinerary();
    this.goToItineary();
  }
}
