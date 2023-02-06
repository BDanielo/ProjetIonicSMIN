import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LineSchedule } from '../interfaces/line-schedule';

export interface TramLine {
  id: string;
  gtfsId: string;
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  mode: string;
  type: string;
}

export interface TramStation {
  id: string;
  code: string;
  city: string;
  name: string;
  visible: boolean;
  lat: number;
  lon: number;
}

export interface StationsOfLine {
  Line: string;
  TramStation: TramStation[];
}

export interface TimesObject {
  headsign: string;
  occupancy: string;
  realtimeArrival: number;
  stopName: string;
  arrivalDelay: number;
  minutes: number;
}

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
}

export interface LegGeometry {
  points: string;
  length: number;
}

export interface GeoPoint {
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

  // https://data.mobilites-m.fr/api/routers/default/index/clusters/SEM:GENLETOILE/stoptimes?route=SEM%3AA

  private URLhorairesArret =
    'routers/default/index/clusters/:station/stoptimes?route=:line';

  // https://data.mobilites-m.fr/api/routers/default/plan?routerId=prod&otp=undefined&mode=TRANSIT&showIntermediateStops=true&numItineraries=3&maxWalkDistance=1000&fromPlace=45.18999132364521,5.715137975226607&toPlace=45.18908931392589,5.698438510275174&arriveBy=false&time=11:56&date=2023-02-03&ui_date=vendredi-03-f%C3%A9vrier-03/02/2023&locale=fr_FR&walkReluctance=10

  public TramLines: TramLine[] = [];
  public TramStations: StationsOfLine[] = [];

  constructor(private http: HttpClient) {}

  // get stop times from station id and line id | use TramStations.TramTramStation.id and TramStations.TramLines.id
  getStopTimesFromStation(station: string, line: string) {
    let url =
      this.mtagApiUrl +
      this.URLhorairesArret.replace(':station', station).replace(':line', line);

    // console.log('STOP TIMES | URL : ' + url);

    this.http
      .get(url, {
        headers: {
          Origin: 'https://www.armieux.fr',
        },
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
            let minutes = date.getMinutes();
            console.log(minutes);
            lineSchedule.times.push(minutes.toString());
          });
          lineSchedules.push(lineSchedule);
        });

        // console.log('LINE SCHEDULES : ');
        // console.log(lineSchedules);

        return lineSchedules;
      });
  }

  getTramStations(id: string) {
    return this.http.get(
      this.mtagApiUrl + this.URLarretsLignes.replace(':id', id)
    );
  }

  getTramLines() {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.mtagApiUrl + this.URLlignes.replace(':transport', 'TRAM'))
        .subscribe((data: any) => {
          this.TramLines = data;
          // console.log(this.lignesTram);
          resolve(this.TramLines);
        });
    });
  }

  getAllTramStations() {
    return new Promise((resolve, reject) => {
      this.TramStations = [];
      this.getTramLines().then((data) => {
        this.TramLines.forEach((element) => {
          this.getTramStations(element.id).subscribe((data: any) => {
            let StationsOfLine: StationsOfLine = {
              Line: element.id,
              TramStation: data,
            };
            this.TramStations.push(StationsOfLine);
          });
        });
        console.log('LINES : ');
        console.log(this.TramLines);
        console.log('STATIONS : ');
        console.log(this.TramStations);
        resolve(this.TramStations);
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
          console.log('CALC ITINERARY');
          console.log(url);
          console.log(data);
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
            console.log('ITINERARY :');
            // get min duration
            if (minDuration === 0) {
              minDuration = element.duration;
              Itinerarie = element;
            } else if (minDuration > element.duration) {
              minDuration = element.duration;
              Itinerarie = element;
            }
            console.log(element);
          });
          console.log('ITINERARIE : ');
          console.log(Itinerarie);
          resolve(Itinerarie);
          return Itinerarie;
        });
    });
  }

  getTramStationsOfLine(id: string) {
    this.getAllTramStations();
    return this.TramStations.find((element) => element.Line === id);
  }
}
