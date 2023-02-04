import { Component } from '@angular/core';
import * as L from 'leaflet';
import { Geolocation, Position } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  map: L.Map | undefined;
  constructor() {}

  ionViewDidEnter() {
    // set leaflet images path
    L.Icon.Default.imagePath = '/assets/images/leaflet/';

    // create map
    this.map = L.map('map').setView([45.19270700749426, 5.718059703818313], 20);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.map);

    // add marker IUT1
    const IUT1 = L.marker([45.19270700749426, 5.718059703818313]).addTo(
      this.map
    );
    IUT1.bindPopup('IUT1');
    this.map.addLayer(IUT1);

    // get localisation
    this.getLocation();
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
}
