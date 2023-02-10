import { Component } from '@angular/core';
import { StationsOfLine } from '../interfaces/stations-of-line';
import { GeoPoint, MTAGAPIService } from '../services/mtag-api.service';
import { Geolocation, Position } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  constructor(public mtagService: MTAGAPIService) {}
  tramStations: StationsOfLine[] = [];
  tramStationsClosest: StationsOfLine[] = [];

  ngOnInit() {
    this.mtagService.getAllTramStations().then((data: any) => {
      this.tramStations = data;
      this.tramStations.sort((a, b) => {
        if (a.Line.length > b.Line.length) {
          return 1;
        } else if (a.Line.length < b.Line.length) {
          return -1;
        } else {
          if (a.Line > b.Line) {
            return 1;
          } else if (a.Line < b.Line) {
            return -1;
          } else {
            return 0;
          }
        }
      });
    });

    // this.getLocation().then((position: any) => {
    //   this.mtagService.getClosestStation(position).then((station) => {
    //     this.tramStationsClosest[0] = station;
    //   });
    // });
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
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
