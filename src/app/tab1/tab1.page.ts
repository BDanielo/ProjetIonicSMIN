import { Component } from '@angular/core';

// import leaflet routing machine
import * as leaflet from 'leaflet';
import 'leaflet-routing-machine';
import { Geolocation, Position } from '@capacitor/geolocation';
import {
  GeoPoint,
  Itineraries,
  leg,
  MTAGAPIService,
  StationsOfLine,
  TramLine,
  TramStation,
} from '../services/mtag-api.service';

import 'polyline-encoded';

declare var L: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  map: L.Map | undefined;

  lignesTram: TramLine[] = [];

  constructor(public MtagService: MTAGAPIService) {}
  //constructor() {}

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

    // add marker IUT1
    const IUT1 = leaflet
      .marker([45.19270700749426, 5.718059703818313])
      .addTo(this.map);
    IUT1.bindPopup('IUT1');
    this.map.addLayer(IUT1);

    // get localisation
    this.getLocation();

    // add marker for each tramA element
    // this.tramA.forEach((element) => {
    //   const marker = leaflet
    //     .marker([element.lat, element.lon])
    //     .addTo(this.map!);
    //   marker.bindPopup(element.name);
    //   this.map!.addLayer(marker);
    // });

    // L.Routing.control({
    //   waypoints: [
    //     L.latLng(45.19270700749426, 5.718059703818313),
    //     L.latLng(45.18912, 5.69409),
    //   ],
    // }).addTo(this.map);

    // this.MtagService.getTramStation('SEM:A').subscribe((data: any) => {
    //   this.tramA = data;
    //   console.log(this.tramA);
    // });

    // this.MtagService.getTramLines().subscribe((data: any) => {
    //   this.lignesTram = data;
    //   console.log(this.lignesTram);
    // });

    // console.log(
    //   this.MtagService.calcItinerary(
    //     45.19270700749426,
    //     5.718059703818313,
    //     45.189162995391825,
    //     5.696816464474088,
    //     false,
    //     '',
    //     ''
    //   )
    // );

    this.getItinerarie();

    this.MtagService.getAllTramStations().then((data: any) => {
      //this.markEveryStation();
      console.log('HEY');
      console.log(this.MtagService.TramStations);
    });

    console.log(
      this.MtagService.getStopTimesFromStation('SEM:GENLETOILE', 'SEM:A')
    );

    var encoded =
      'muyrG{x{a@GXW`AADAFHD@@PLjDzBFHLfAh@OBAJCBNd@vD@FD^NG@Jt@`@rAt@BA@EVKJGr@YAE';
    var polyline = L.Polyline.fromEncoded(encoded).addTo(this.map);
  }

  getLocation(): Promise<Position> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition()
        .then((position: any) => {
          console.log('location from service : ', position);
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

  markStation(station: TramStation) {
    const marker = leaflet.marker([station.lat, station.lon]).addTo(this.map!);
    marker.bindPopup(station.name);
    this.map!.addLayer(marker);
  }

  markEveryStation() {
    console.log('MARK EVERY STATION');
    this.MtagService.TramStations.forEach((Line) => {
      console.log(Line);
      Line.TramStation.forEach((station) => {
        console.log(station);
        this.markStation(station);
      });
    });
  }

  getItinerarie() {
    let from: GeoPoint = { lat: 45.19270700749426, lon: 5.718059703818313 };
    let to: GeoPoint = { lat: 45.189162995391825, lon: 5.696816464474088 };
    this.MtagService.calcItinerary(from, to, false, '', '').then(
      (data: any) => {
        console.log(data);
        data.legs.forEach((leg: leg) => {
          console.log(leg);
          // leg.legGeometry.points
          var polyline = L.Polyline.fromEncoded(leg.legGeometry.points);
          if (leg.mode == 'WALK') polyline.setStyle({ color: 'blue' });
          else polyline.setStyle({ color: 'red' });
          polyline.addTo(this.map);
        });
      }
    );
  }
}
