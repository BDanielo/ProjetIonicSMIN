import { Component } from '@angular/core';
import { StationsOfLine } from '../interfaces/stations-of-line';
import { MTAGAPIService } from '../services/mtag-api.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(public mtagService: MTAGAPIService) {}
  tramStations: StationsOfLine[] = [];

  ngOnInit() {
    this.mtagService.getAllTramStations().then((data:any ) => {
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
      }
      );

    });
  }

}
