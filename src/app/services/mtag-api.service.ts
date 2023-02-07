import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LineSchedule } from '../interfaces/line-schedule';
import { TramLine } from '../interfaces/tram-line';
import { StationsOfLine } from '../interfaces/stations-of-line';

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
              let now = new Date();

              let minutes =
                date.getHours() * 60 +
                date.getMinutes() -
                (now.getMinutes() + now.getHours() * 60) -
                60;

              //let minutes = date.getMinutes() - now.getMinutes();
              console.log(minutes);
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
        resolve(this.TramStations);
      });
    });
  }

  calcItinerary(
    LatSource: number,
    LonSource: number,
    LatTarget: number,
    LonTarget: number
  ) {
    // get current date
    let dateNow = new Date();

    let time = dateNow.getHours() + ':' + dateNow.getMinutes();

    let date =
      dateNow.getFullYear() + '-' + dateNow.getMonth() + '-' + dateNow.getDay();

    let url =
      this.mtagApiUrl +
      this.URLitineraire +
      '?routerId=prod' +
      '&otp=undefined' +
      '&mode=TRANSIT' +
      '&showIntermediateStops=true' +
      '&numItineraries=3' +
      '&fromPlace=' +
      LatSource +
      ',' +
      LonSource +
      '&toPlace=' +
      LatTarget +
      ',' +
      LonTarget +
      '&arriveBy=false' +
      '&time=' +
      time +
      '&date=' +
      date +
      '&locale=fr_FR';
    console.log(url);
    console.log(this.http.get(url));
  }

  getTramStationsOfLine(id: string) {
    this.getAllTramStations();
    return this.TramStations.find((element) => element.Line === id);
  }
}
