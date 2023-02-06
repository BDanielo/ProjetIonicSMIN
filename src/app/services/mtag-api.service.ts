import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

@Injectable({
  providedIn: 'root',
})
export class MTAGAPIService {
  // declare url of mtag api
  private mtagApiUrl = 'https://data.mobilites-m.fr/api/';
  private data = '';
  private URLarretsLignes = 'routers/default/index/routes/:id/clusters';
  private URLlignes = 'routers/default/index/routes?reseaux=:transport';

  public TramLines: TramLine[] = [];
  private TramStations: StationsOfLine[] = [];

  constructor(private http: HttpClient) {}

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
    // for each element of LigneTram, get the stations
    console.log('test');
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
      console.log(this.TramLines);
      console.log(this.TramStations);
    });
  }
}
