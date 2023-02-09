import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LineSchedule } from '../interfaces/line-schedule';
import { TramLine } from '../interfaces/tram-line';
import { StationsOfLine } from '../interfaces/stations-of-line';

export interface Itineraries {
  duration: number;
  startTime: number;
  endTime: number;
  legs: leg[];
}

export interface leg {
  mode: string;
  legGeometry: LegGeometry;
  duration: number;
  routeId: string;
  routeColor: string;
}

export interface LegGeometry {
  points: string;
  length: number;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface AddressDetails {
  name: string;
  lat: number;
  lon: number;
}

@Injectable({
  providedIn: 'root',
})
export class MTAGAPIService {
  // declare url of mtag api
  private mtagApiUrl = 'https://data.mobilites-m.fr/api/';

  private URLarretsLignes = 'routers/default/index/routes/:id/clusters';

  private URLlignes = 'routers/default/index/routes?reseaux=:transport';

  private URLitineraire = 'routers/default/plan';

  private URLhorairesArret =
    'routers/default/index/clusters/:station/stoptimes?route=:line';

  private URLlignePolyline = 'lines/poly?types=ligne&codes=:ligne&reseaux=SEM';

  private URLnominatimSearch = 'https://nominatim.openstreetmap.org/search';

  private URLnominatimReverse = 'https://nominatim.openstreetmap.org/reverse';

  public TramLines: TramLine[] = [];
  public TramStations: StationsOfLine[] = [];

  public currentItinerary: Itineraries | undefined;

  itineraryEvent: any;

  constructor(private http: HttpClient) {}

  // get stop times from station id and line id | use TramStations.TramTramStation.id and TramStations.TramLines.id
  getStopTimesFromStation(station: string, line: string) {
    return new Promise((resolve, reject) => {
      let url =
        this.mtagApiUrl +
        this.URLhorairesArret.replace(':station', station).replace(
          ':line',
          line
        );

      // console.log('STOP TIMES | URL : ' + url);

      this.http
        .get(url, {
          // headers: {
          //   Origin: 'https://www.armieux.fr',
          // },
        })
        .subscribe((data: any) => {
          // console.log('GET HORAIRE DATA : ');
          // console.log(data);

          let lineSchedules: LineSchedule[] = [];
          //chaque direction
          data.forEach((element: any) => {
            //chaque horaire
            let lineSchedule: LineSchedule = { direction: '', times: [] };
            lineSchedule.direction = element.pattern.desc;
            element.times.forEach((element: any) => {
              let date = new Date(element.realtimeArrival * 1000);
              let now = new Date();

              let minutes =
                date.getHours() * 60 +
                date.getMinutes() -
                (now.getMinutes() + now.getHours() * 60) -
                60;

              //let minutes = date.getMinutes() - now.getMinutes();
              // console.log(minutes);

              lineSchedule.times.push(minutes.toString());
            });
            lineSchedules.push(lineSchedule);
          });

          // console.log('LINE SCHEDULES : ');
          // console.log(lineSchedules);

          resolve(lineSchedules);
          return lineSchedules;
        });
    });
  }

  getTramStations(id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.mtagApiUrl + this.URLarretsLignes.replace(':id', id))
        .subscribe((data: any) => {
          // console.log('DATA TRAM :');
          // console.log(data);
          resolve(data);
        });
    });
  }

  getTramLines() {
    return new Promise((resolve, reject) => {
      if (this.TramLines[0] == undefined) {
        this.http
          .get(
            this.mtagApiUrl +
              this.URLlignes.replace(':transport', 'TRAM,CHRONO')
          )
          .subscribe((data: any) => {
            this.TramLines = data;
            // console.log(this.lignesTram);
            resolve(this.TramLines);
          });
      } else {
        resolve(this.TramLines);
      }
    });
  }

  getAllTramStations() {
    return new Promise((resolve, reject) => {
      // console.log('GET ALL STATIONS');
      // console.log(this.TramStations[0]);
      if (this.TramStations[0] == undefined) {
        this.TramStations = [];
        this.getTramLines().then((data) => {
          this.TramLines.forEach((element) => {
            this.getTramStations(element.id).then((data: any) => {
              // console.log('DATA :');
              // console.log(data);
              let StationsOfLine: StationsOfLine = {
                Line: element.id,
                TramStation: data,
              };
              // console.log(StationsOfLine);
              this.TramStations.push(StationsOfLine);
              // check if this is the last element
              if (element.id == this.TramLines[this.TramLines.length - 1].id) {
                // console.log('FINISHED');
                // console.log(this.TramStations);
                resolve(this.TramStations);
              }
            });
          });
        });
      } else {
        resolve(this.TramStations);
      }
    });
  }

  calcItinerary(
    from: GeoPoint,
    to: GeoPoint,
    arriveBy: boolean,
    time: string,
    date: string
  ) {
    return new Promise((resolve, reject) => {
      var url =
        this.mtagApiUrl +
        this.URLitineraire +
        '?routerId=prod&otp=undefined&mode=TRANSIT&showIntermediateStops=true&numItineraries=5&' +
        `fromPlace=${from.lat},${from.lon}&toPlace=${to.lat},${to.lon}&arriveBy=${arriveBy}&time=${time}&date=${date}&locale=fr_FR`;
      let dateNow = new Date();

      time = dateNow.getHours() + ':' + dateNow.getMinutes();

      date =
        dateNow.getFullYear() +
        '-' +
        dateNow.getMonth() +
        '-' +
        dateNow.getDay();

      this.http
        .get(url, {
          headers: {
            Origin: 'https://www.armieux.fr',
          },
        })
        .subscribe((data: any) => {
          // console.log('CALC ITINERARY');
          // console.log(url);
          // console.log(data);
          let test: string[] = [];
          // chaques itinéraires
          let Itinerarie: Itineraries = {
            duration: 0,
            legs: [],
            startTime: 0,
            endTime: 0,
          };

          let minDuration: number = 0;

          data.plan.itineraries.forEach((element: Itineraries) => {
            // console.log('ITINERARY :');
            // get min duration
            if (minDuration === 0) {
              minDuration = element.duration;
              Itinerarie = element;
            } else if (minDuration > element.duration) {
              minDuration = element.duration;
              Itinerarie = element;
            }
            // console.log(element);
          });
          // console.log('ITINERARIE : ');
          // console.log(Itinerarie);
          resolve(Itinerarie);
          return Itinerarie;
        });
    });
  }

  calcItinerarys(
    from: GeoPoint,
    to: GeoPoint,
    arriveBy: boolean,
    time: string,
    date: string
  ) {
    return new Promise((resolve, reject) => {
      var url =
        this.mtagApiUrl +
        this.URLitineraire +
        '?routerId=prod&otp=undefined&mode=WALK,TRAM,BUS&showIntermediateStops=true&numItineraries=5&' +
        `fromPlace=${from.lat},${from.lon}&toPlace=${to.lat},${to.lon}&arriveBy=${arriveBy}&time=${time}&date=${date}&locale=fr_FR`;
      let dateNow = new Date();

      time = dateNow.getHours() + ':' + dateNow.getMinutes();

      date =
        dateNow.getFullYear() +
        '-' +
        dateNow.getMonth() +
        '-' +
        dateNow.getDay();

      this.http
        .get(url, {
          headers: {
            Origin: 'https://www.armieux.fr',
          },
        })
        .subscribe((data: any) => {
          // console.log('CALC ITINERARY');
          // console.log(url);
          // console.log(data);
          let test: string[] = [];
          // chaques itinéraires
          let Itinerarie: Itineraries = {
            duration: 0,
            legs: [],
            startTime: 0,
            endTime: 0,
          };
          resolve(data.plan.itineraries);
          return data.plan.itineraries;
        });
    });
  }

  getTramStationsOfLine(id: string) {
    this.getAllTramStations();
    return this.TramStations.find((element) => element.Line === id);
  }

  getLinesPolyline(line: string) {
    return new Promise((resolve, reject) => {
      line = line.replace(':', '_');
      this.http
        .get(this.mtagApiUrl + this.URLlignePolyline.replace(':ligne', line))
        .subscribe((data: any) => {
          // console.log(data);
          resolve(data);
        });
    });
  }

  reverseGeoCoding(lat: number, lon: number, details: boolean = false) {
    return new Promise((resolve, reject) => {
      let url =
        this.URLnominatimReverse +
        `?lat=${lat}&lon=${lon}&namedetails=1&addressdetails=1&format=json`;
      this.http.get(url).subscribe((data: any) => {
        console.log('POS :' + lat + ',' + lon + ' url : ' + url);
        // console.log(data);

        let nameAdr: string = '';
        if (details) {
          nameAdr = data.display_name;
        } else {
          if (data.address.amenity != undefined) {
            nameAdr += data.address.amenity;
          } else {
            if (data.address.house_number != undefined) {
              nameAdr += data.address.house_number + ' ';
            }

            if (data.address.road != undefined) {
              nameAdr += data.address.road;
            }

            if (data.address.town != undefined) {
              nameAdr += ', ' + data.address.town;
            }

            if (data.address.city != undefined) {
              nameAdr += ', ' + data.address.city;
            }
          }
        }

        let adresse: AddressDetails = {
          name: nameAdr,
          lat: data.lat,
          lon: data.lon,
        };
        console.log(adresse);

        resolve(adresse);
      });
    });
  }

  searchGeocoding(search: string) {
    //alert(search);
    return new Promise((resolve, reject) => {
      let url =
        this.URLnominatimSearch +
        `?street=${encodeURI(search)}&county=Isere&format=json`;
      this.http.get(url).subscribe((data: any) => {
        console.log(search + ' url : ' + url);

        this.reverseGeoCoding(data[0].lat, data[0].lon).then((data: any) => {
          resolve(data);
        });
      });
    });
  }

  searchSimpleGeoCoding(search: string) {
    //alert(search);
    return new Promise((resolve, reject) => {
      let url = this.URLnominatimSearch + `?q=${encodeURI(search)}&format=json`;
      this.http.get(url).subscribe((data: any) => {
        console.log(search + ' url : ' + url);

        this.reverseGeoCoding(data[0].lat, data[0].lon).then((data: any) => {
          resolve(data);
        });
      });
    });
  }

  searchAutocomplete(search: string, retry: boolean = false) {
    return new Promise((resolve, reject) => {
      let url = '';
      if (retry) {
        url =
          this.URLnominatimSearch +
          `?q=${encodeURI(search)}&limit=5&format=json`;
      } else {
        url =
          this.URLnominatimSearch +
          `?street=${encodeURI(search)}&county=Isere&limit=5&format=json`;
      }
      this.http.get(url).subscribe((data: any) => {
        console.log(search + ' url : ' + url);
        console.log(data);

        let list: AddressDetails[] = [];

        if (data.length === 0) {
          if (retry) {
            resolve(null);
          } else {
            resolve(this.searchAutocomplete(search, true));
          }
        } else {
          data.forEach((element: any) => {
            let tempAdr: AddressDetails = {
              name: element.display_name,
              lat: element.lat,
              lon: element.lon,
            };

            // remove all character after Isère in name
            let index = tempAdr.name.indexOf('Isère');
            if (index > 0) {
              tempAdr.name = tempAdr.name.substring(0, index - 2);
            }

            list.push(tempAdr);
            // if last element
            if (element === data[data.length - 1]) {
              // console.log(list);
              resolve(list);
            }
          });
        }
      });
    });
  }
}
