import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LineSchedule } from '../interfaces/line-schedule';
import { MTAGAPIService } from '../services/mtag-api.service';
import { FavoritesService } from '../services/favorites.service';
import { Favorite } from '../interfaces/favorite';

interface LineColor {
  [key: string]: string;
}

@Component({
  selector: 'app-drop-down-schedule',
  templateUrl: './drop-down-schedule.component.html',
  styleUrls: ['./drop-down-schedule.component.scss'],
})
export class DropDownScheduleComponent implements OnInit {
  @Input() name: string = 'Grenoble Gare';
  @Input() lineName: string = 'B';
  @Input() isAlert: boolean = false;
  @Input() stationId: string = '';
  @Input() type: string = 'tramStation';
  @Output() favChange = new EventEmitter<boolean>();

  linesSchedule: Array<LineSchedule> = [];

  lineColor: LineColor = {
    A: '#3376B8',
    B: '#479A45',
    C: '#C20078',
    D: '#DE9917',
    E: '#533786',
    C1: '#F5D24D',
    C2: '#F5D24D',
    C3: '#F5D24D',
    C4: '#F5D24D',
    C5: '#F5D24D',
    C6: '#F5D24D',
    C7: '#F5D24D',
  };

  color: string = '';
  customWidth = 65;
  timerInterval: any;

  constructor(
    public mtagService: MTAGAPIService,
    public favoritesService: FavoritesService
  ) {}

  ngOnInit() {
    this.color = this.lineColor[this.lineName];
    this.testIcon();
    this.favoritesService.IdIsFavorite(this.stationId, this.lineName)
      ? (this.isFavorite = true)
      : (this.isFavorite = false);
  }

  ngAfterContentChecked() {
    this.favoritesService.IdIsFavorite(this.stationId, this.lineName)
      ? (this.isFavorite = true)
      : (this.isFavorite = false);
  }

  testIcon() {
    if (this.isAlert) {
      this.customWidth = 50;
    } else {
      this.customWidth = 65;
    }
  }

  ngOnDestroy() {
    if (this.timerInterval != null) {
      clearInterval(this.timerInterval);
    }
  }

  isOpen = false;
  isFavorite = false;

  getSchedule() {
    this.mtagService
      .getStopTimesFromStation(this.stationId, 'SEM:' + this.lineName)
      .then((data: any) => {
        this.linesSchedule = data;
        if (data == undefined || data.length == 0) {
          this.isAlert = true;
          this.testIcon();
        }
      });
  }

  toggleDropDown() {
    if (this.type == 'tramStation'){
      this.favoritesService.IdIsFavorite(this.stationId, this.lineName)
        ? (this.isFavorite = true)
        : (this.isFavorite = false);
  
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.getSchedule();
        this.timerInterval = setInterval(() => {
          this.getSchedule();
        }, 30000);
      } else if (this.timerInterval != null) {
        clearInterval(this.timerInterval);
      }
    }
  }

  toggleFavorite() {
    if (this.type == 'tramStation') {
      this.isFavorite = !this.isFavorite;
      if (this.isFavorite) {
        this.favoritesService.addFavorite({
          name: this.name,
          type: 'tramStation',
          stationId: this.stationId,
          line: this.lineName,
          lat: 0,
          lon: 0,
        });
      } else {
        this.favoritesService.removeFavorite(this.stationId, this.lineName);
        this.favChange.emit();
      }
    }else {

      this.favoritesService.removeFavoriteByName(this.name, this.type);
      this.favChange.emit();
    
    }
  }
}
