import { Component } from '@angular/core';

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
} from '../services/mtag-api.service';
import { TramStation } from '../interfaces/tram-station';
import { TramLine } from '../interfaces/tram-line';
import { LineSchedule } from '../interfaces/line-schedule';
import { StationsOfLine } from '../interfaces/stations-of-line';

import 'polyline-encoded';
import { FavoritesService } from '../services/favorites.service';

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

  markerSearch: any;
  markerSearchFav: boolean = false;
  markerSearchInfo: AddressDetails = {} as AddressDetails;

  fromSearch: string = 'gare de grenoble';
  toSearch: string = '33 avenue aristide briand';

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

  ItineraryLayerState: boolean = false;

  constructor(
    public MtagService: MTAGAPIService,
    public favoritesService: FavoritesService
  ) {}
  //constructor() {}asdaw

  ionViewDidEnter() {
    // set leaflet images path
    leaflet.Icon.Default.imagePath = '/assets/images/leaflet/';

    // create map
    this.map = leaflet
      .map('map', { zoomControl: false })
      .setView([45.19270700749426, 5.718059703818313], 20);
    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      })
      .addTo(this.map);

    // add geocoder control
    // L.Control.geocoder().addTo(this.map);

    // add tram line layer
    this.TramLineLayer = L.layerGroup().addTo(this.map);

    // add itinerarie layer
    this.ItinerarieLayer = L.layerGroup().addTo(this.map);

    // add tram station layer
    this.TramStationLayer = L.layerGroup().addTo(this.map);

    // add marker IUT1
    const IUT1 = leaflet
      .marker([45.19270700749426, 5.718059703818313])
      .addTo(this.map);
    IUT1.bindPopup('IUT1');
    this.map.addLayer(IUT1);

    // get localisation
    this.getLocation();

    // console.log(test);

    // this.MtagService.getStopTimesFromStation('SEM:GENLETOILE', 'SEM:A').then(
    //   (data: any) => {
    //     console.log('GET STOPS FROM STATION');
    //     console.log(data);
    //   }
    // );

    let from: GeoPoint = { lat: 45.19270700749426, lon: 5.718059703818313 };
    let to: GeoPoint = { lat: 45.189162995391825, lon: 5.696816464474088 };

    // 45.191247592086214, 5.713803536078038
    let gare: GeoPoint = { lat: 45.191247592086214, lon: 5.713803536078038 };

    // this.markStations();
    this.markLines();
    // this.getItinerarie(from, to);

    this.MtagService.searchGeocoding('gare grenoble').then((data: any) => {});

    this.MtagService.searchGeocoding('33 avenue aristide briand').then(
      (data: any) => {}
    );

    // this.MtagService.getAllTramStations().then((data: any) => {
    //   console.log('GET ALL STATIONS 2//');
    //   this.MtagService.getAllTramStations().then((data: any) => {});
    // });
  }

  getLocation(): Promise<Position> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition()
        .then((position: any) => {
          // console.log('location from service : ', position);
          resolve(position);
          // set map localisation
          this.map?.setView(
            [position.coords.latitude, position.coords.longitude],
            20
          );
          // add marker localisation
          const localisation = L.marker([
            position.coords.latitude,
            position.coords.longitude,
          ]).addTo(this.map!);
          localisation.bindPopup('Localisation');
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
          console.log(leg);

          var polyline = L.Polyline.fromEncoded(leg.legGeometry.points);

          if (leg.mode == 'WALK') {
            polyline.setStyle({ color: 'red' });
          } else {
            polyline.setStyle({ color: '#' + leg.routeColor });
          }

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

  // get tram lines add them to a layer and add the layer to the map
  markLines() {
    return new Promise((resolve, reject) => {
      this.map!.removeLayer(this.ItinerarieLayer);
      this.map!.removeLayer(this.TramStationLayer);
      this.TramLineLayer = L.layerGroup().addTo(this.map);
      this.MtagService.getTramLines().then((data: any) => {
        this.lignesTram = data;
        // console.log('Lignes de tram');
        // console.log(data);
        this.lignesTram.forEach((ligne: TramLine) => {
          this.MtagService.getLinesPolyline(ligne.id).then((data: any) => {
            let LineGeoPoints = data.features[0].properties.shape[0];
            // console.log(LineGeoPoints);
            var polyline = L.Polyline.fromEncoded(LineGeoPoints);
            // console.log(ligne.color);
            polyline.setStyle({ color: '#' + ligne.color });
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
        console.log(data);
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
    // console.log(query);
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
        type: 'custom',
        stationId: '',
        line: '',
        lat: this.markerSearchInfo.lat,
        lon: this.markerSearchInfo.lon,
      });
    } else {
      this.map?.removeLayer(this.markerSearch);
    }
  }

  search(lat: number, lon: number) {
    this.MtagService.reverseGeoCoding(lat, lon).then((data: any) => {
      this.SearchResults = data;
      if (this.markerSearch) this.map?.removeLayer(this.markerSearch);
      this.markerSearch = L.marker([data.lat, data.lon]).addTo(this.map!);

      this.markerSearchInfo = data;

      let buttonAller = `<ion-button
        (click)="search('test')"
        >-> Aller vers</ion-button>`;

      let buttonFav = `<button *ngIf="markerSearchFav" onclick="toggleMarkerSearchFav()"><ion-icon name="heart"></ion-icon></button>`;

      console.log('markerSearchFav');
      console.log(this.markerSearchFav);
      console.log(this.markerSearchInfo);

      let popupContent = '<p>' + data.name + '</p>' + buttonAller + buttonFav;
      this.markerSearch.bindPopup(popupContent);
      this.map?.setView([data.lat, data.lon], 20);
      this.markerSearch.openPopup();
    });
  }
}
