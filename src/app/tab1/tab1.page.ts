import { Component } from '@angular/core';

// import leaflet routing machine
import * as leaflet from 'leaflet';
import 'leaflet-routing-machine';
import { Geolocation, Position } from '@capacitor/geolocation';
import {
  MTAGAPIService,
  TramLine,
  TramStation,
} from '../services/mtag-api.service';

declare var L: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  map: L.Map | undefined;

  private tramA = [
    {
      id: 'SEM:LETOILE',
      code: 'SEM:GENLETOILE',
      city: 'Le Pont-de-Claix',
      name: "L'Etoile",
      visible: true,
      lat: 45.13788,
      lon: 5.7033,
    },
    {
      id: 'SEM:CHANDON',
      code: 'SEM:GENCHANDON',
      city: 'Le Pont-de-Claix',
      name: 'Edmée Chandon',
      visible: true,
      lat: 45.13671,
      lon: 5.7083,
    },
    {
      id: 'SEM:DENPAPIN',
      code: 'SEM:GENDENPAPIN',
      city: 'Échirolles',
      name: 'Denis Papin',
      visible: true,
      lat: 45.13832,
      lon: 5.71307,
    },
    {
      id: 'SEM:ADELAUNE',
      code: 'SEM:GENADELAUNE',
      city: 'Échirolles',
      name: 'Auguste Delaune',
      visible: true,
      lat: 45.14292,
      lon: 5.71527,
    },
    {
      id: 'SEM:MARIECUR',
      code: 'SEM:GENMARIECUR',
      city: 'Échirolles',
      name: 'Marie Curie',
      visible: true,
      lat: 45.14523,
      lon: 5.71704,
    },
    {
      id: 'SEM:RAMPE',
      code: 'SEM:GENRAMPE',
      city: 'Échirolles',
      name: 'La Rampe - Centre-Ville',
      visible: true,
      lat: 45.14948,
      lon: 5.71818,
    },
    {
      id: 'SEM:ECHIGARE',
      code: 'SEM:GENECHIGARE',
      city: 'Échirolles',
      name: 'Echirolles Gare',
      visible: true,
      lat: 45.15302,
      lon: 5.71848,
    },
    {
      id: 'SEM:ESSARTS',
      code: 'SEM:GENESSARTS',
      city: 'Échirolles',
      name: 'Essarts - La Butte',
      visible: true,
      lat: 45.15588,
      lon: 5.71909,
    },
    {
      id: 'SEM:SURIEUX',
      code: 'SEM:GENSURIEUX',
      city: 'Échirolles',
      name: 'Surieux',
      visible: true,
      lat: 45.15846,
      lon: 5.72192,
    },
    {
      id: 'SEM:GRANGES',
      code: 'SEM:GENGRANGES',
      city: 'Échirolles',
      name: 'Les Granges',
      visible: true,
      lat: 45.15696,
      lon: 5.72781,
    },
    {
      id: 'SEM:POLESUD',
      code: 'SEM:GENPOLESUD',
      city: 'Grenoble',
      name: 'Polesud - Alpexpo',
      visible: true,
      lat: 45.15715,
      lon: 5.73384,
    },
    {
      id: 'SEM:GRDPLACE',
      code: 'SEM:GENGRDPLACE',
      city: 'Grenoble',
      name: "Grand'place",
      visible: true,
      lat: 45.15893,
      lon: 5.73179,
    },
    {
      id: 'SEM:ARLEQUIN',
      code: 'SEM:GENARLEQUIN',
      city: 'Grenoble',
      name: 'Arlequin',
      visible: true,
      lat: 45.16359,
      lon: 5.73047,
    },
    {
      id: 'SEM:BRUYERE',
      code: 'SEM:GENBRUYERE',
      city: 'Grenoble',
      name: 'La Bruyère-Parc Jean Verlhac',
      visible: true,
      lat: 45.16635,
      lon: 5.73118,
    },
    {
      id: 'SEM:MALHERBE',
      code: 'SEM:GENMALHERBE',
      city: 'Grenoble',
      name: 'Malherbe',
      visible: true,
      lat: 45.16928,
      lon: 5.73229,
    },
    {
      id: 'SEM:MAICULTU',
      code: 'SEM:GENMAICULTU',
      city: 'Grenoble',
      name: 'MC2: Maison de la Culture',
      visible: true,
      lat: 45.17347,
      lon: 5.73206,
    },
    {
      id: 'SEM:MOUNIER',
      code: 'SEM:GENMOUNIER',
      city: 'Grenoble',
      name: 'Mounier',
      visible: true,
      lat: 45.179,
      lon: 5.73179,
    },
    {
      id: 'SEM:ALB1BELG',
      code: 'SEM:GENALB1BELG',
      city: 'Grenoble',
      name: 'Albert 1er de Belgique',
      visible: true,
      lat: 45.18168,
      lon: 5.73167,
    },
    {
      id: 'SEM:CHAVANT',
      code: 'SEM:GENCHAVANT',
      city: 'Grenoble',
      name: 'Chavant',
      visible: true,
      lat: 45.18466,
      lon: 5.73177,
    },
    {
      id: 'SEM:VERDUN',
      code: 'SEM:GENVERDUN',
      city: 'Grenoble',
      name: 'Verdun - Préfecture',
      visible: true,
      lat: 45.1883,
      lon: 5.73144,
    },
    {
      id: 'SEM:DUBEDOUT',
      code: 'SEM:GENDUBEDOUT',
      city: 'Grenoble',
      name: 'Hubert Dubedout - Maison du Tourisme',
      visible: true,
      lat: 45.1902,
      lon: 5.72822,
    },
    {
      id: 'SEM:VICTHUGO',
      code: 'SEM:GENVICTHUGO',
      city: 'Grenoble',
      name: 'Victor Hugo',
      visible: true,
      lat: 45.18938,
      lon: 5.72499,
    },
    {
      id: 'SEM:ALSACELO',
      code: 'SEM:GENALSACELO',
      city: 'Grenoble',
      name: 'Alsace-Lorraine',
      visible: true,
      lat: 45.18911,
      lon: 5.7193,
    },
    {
      id: 'SEM:GARES',
      code: 'SEM:GENGARES',
      city: 'Grenoble',
      name: 'Gares',
      visible: true,
      lat: 45.19078,
      lon: 5.71554,
    },
    {
      id: 'SEM:STBRUNO',
      code: 'SEM:GENSTBRUNO',
      city: 'Grenoble',
      name: 'Saint-Bruno',
      visible: true,
      lat: 45.18833,
      lon: 5.71351,
    },
    {
      id: 'SEM:BERRIAT',
      code: 'SEM:GENBERRIAT',
      city: 'Grenoble',
      name: 'Berriat-Le Magasin',
      visible: true,
      lat: 45.18878,
      lon: 5.70588,
    },
    {
      id: 'SEM:FONTAINA',
      code: 'SEM:GENFONTAINA',
      city: 'Fontaine',
      name: 'Les Fontainades - Le Vog',
      visible: true,
      lat: 45.18909,
      lon: 5.69844,
    },
    {
      id: 'SEM:MAISONNA',
      code: 'SEM:GENMAISONNA',
      city: 'Fontaine',
      name: 'Louis Maisonnat',
      visible: true,
      lat: 45.18912,
      lon: 5.69409,
    },
    {
      id: 'SEM:FONTAHDV',
      code: 'SEM:GENFONTAHDV',
      city: 'Fontaine',
      name: 'Fontaine Hôtel de Ville - La Source',
      visible: true,
      lat: 45.19134,
      lon: 5.68727,
    },
    {
      id: 'SEM:CHARLMIC',
      code: 'SEM:GENCHARLMIC',
      city: 'Fontaine',
      name: 'Charles Michels',
      visible: true,
      lat: 45.19385,
      lon: 5.68009,
    },
    {
      id: 'SEM:LAPOYA',
      code: 'SEM:GENLAPOYA',
      city: 'Fontaine',
      name: 'La Poya',
      visible: true,
      lat: 45.19709,
      lon: 5.67222,
    },
  ];

  lignesTram: TramLine[] = [];

  constructor(public MtagService: MTAGAPIService) {}
  //constructor() {}

  ionViewDidEnter() {
    // set leaflet images path
    leaflet.Icon.Default.imagePath = '/assets/images/leaflet/';

    // create map
    this.map = leaflet
      .map('map')
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
    this.tramA.forEach((element) => {
      const marker = leaflet
        .marker([element.lat, element.lon])
        .addTo(this.map!);
      marker.bindPopup(element.name);
      this.map!.addLayer(marker);
    });

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

    this.MtagService.getAllTramStations();
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
