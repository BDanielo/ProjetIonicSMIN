import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LineSchedule } from '../interfaces/line-schedule';
import { TramLine } from '../interfaces/tram-line';
import { StationsOfLine } from '../interfaces/stations-of-line';
import { TramStation } from '../interfaces/tram-station';

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
  routeShortName: string;
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

  private URLclosest = 'linesNear/json?x=:lon&y=:lat&dist=:dist&details=true';

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

      this.http
        .get(url, {
          // headers: {
          //   Origin: 'https://www.armieux.fr',
          // },
        })
        .subscribe((data: any) => {
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

              lineSchedule.times.push(minutes.toString());
            });
            lineSchedules.push(lineSchedule);
          });

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
            resolve(this.TramLines);
          });
      } else {
        resolve(this.TramLines);
      }
    });
  }

  getAllTramStations() {
    return new Promise((resolve, reject) => {
      if (this.TramStations[0] == undefined) {
        let TramStations: StationsOfLine[] = [];
        this.getTramLines().then((data) => {
          this.TramLines.forEach((element) => {
            this.getTramStations(element.id).then((data: any) => {
              let StationsOfLine: StationsOfLine = {
                Line: element.id,
                TramStation: data,
              };
              TramStations.push(StationsOfLine);
              // check if this is the last element
              if (element.id == this.TramLines[this.TramLines.length - 1].id) {
                this.TramStations = TramStations;
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

  convertStopToCluster(line: string, stop: string) {
    return new Promise<TramStation>((resolve, reject) => {
      // get all characters after the first ,
      stop = stop.substring(stop.indexOf(',') + 2);
      this.getAllTramStations().then((data) => {
        // fine the line
        let lineIndex = this.TramStations.findIndex(
          (element) => element.Line == line
        );
        // find the stop
        let stopIndex = this.TramStations[lineIndex].TramStation.findIndex(
          (element) => element.name == stop
        );

        let cluster = this.TramStations[lineIndex].TramStation[stopIndex];
        resolve(cluster);
      });
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
            // get min duration
            if (minDuration === 0) {
              minDuration = element.duration;
              Itinerarie = element;
            } else if (minDuration > element.duration) {
              minDuration = element.duration;
              Itinerarie = element;
            }
          });
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
              resolve(list);
            }
          });
        }
      });
    });
  }

  // get the closest station from position
  getClosestStation(geoPoint: GeoPoint) {
    return new Promise<StationsOfLine>((resolve, reject) => {
      let lat = Math.round(geoPoint.lat * 100) / 100;
      let lon = Math.round(geoPoint.lon * 100) / 100;
      let url =
        this.mtagApiUrl +
        this.URLclosest.replace(':lat', lat.toString())
          .replace(':lon', lon.toString())
          .replace(':dist', '300');

      this.http.get(url).subscribe((data: any) => {
        // limit data to 5 element
        if (data.length > 5) {
          data = data.slice(0, 5);
        }
        let tmpList: StationsOfLine = {
          Line: 'custom',
          TramStation: [],
        };
        let count = 0;

        data.forEach((element: any) => {
          this.convertStopToCluster(element.lines[0], element.name).then(
            (data2: TramStation) => {
              // let Station: StationsOfLine = {
              //   Line: 'custom',
              //   TramStation: [data2],
              // };

              let Station: TramStation = data2;

              // // check if station with the same line already exist, and if yes replace it
              // let index = tmpList.findIndex((x) => x.Line === Station.Line);
              // if (index > -1) {
              //   tmpList[index].TramStation.push(Station.TramStation[0]);
              // } else {
              //   tmpList.push(Station);
              // }
              tmpList.TramStation.push(Station);

              count++;
              if (count == data.length) {
                // filter duplicate station based on station name
                tmpList.TramStation = tmpList.TramStation.filter(
                  (thing, index, self) =>
                    index === self.findIndex((t) => t.name === thing.name)
                );

                resolve(tmpList);
              }
            }
          );
        });
      });
    });
  }
}
