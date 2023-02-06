import { Component, Input, OnInit } from '@angular/core';
import { LineSchedule } from '../interfaces/line-schedule';
import { MTAGAPIService } from '../services/mtag-api.service';

interface LineColor {
  [key: string]: string;
}

@Component({
  selector: 'app-drop-down-schedule',
  templateUrl: './drop-down-schedule.component.html',
  styleUrls: ['./drop-down-schedule.component.scss'],
})
export class DropDownScheduleComponent implements OnInit {

  @Input() name: string = "Grenoble Gare"; 
  @Input() lineName: string = "B";
  @Input() isAlert: boolean = false;
  @Input() stationId: string = "";

  linesSchedule: Array<LineSchedule> | undefined;

  lineColor: LineColor = {
    A: "#3376B8",
    B: "#479A45",
    C: "#C20078",
    D: "#DE9917",
    E: "#533786",
    C1: "#FF0000",
    C2: "#FF0000",
    C3: "#FF0000",
    C4: "#FF0000",
    C5: "#FF0000",
    C6: "#FF0000",
    C7: "#FF0000",
  }
  
  color:string = "";
  customWidth = 65;
  timerInterval: any;

  constructor(public mtagService: MTAGAPIService) { }


  ngOnInit() {
    this.color = this.lineColor[this.lineName];
    if (this.isAlert) {
      this.customWidth = 50;
    }
  }

  ngOnDestroy() {
    if (this.timerInterval != null){
      clearInterval(this.timerInterval);
    }
  }


  isOpen = false;
  isFavorite = false;

  getSchedule(){
    this.mtagService.getStopTimesFromStation(this.stationId, "SEM:" + this.lineName).then((data:any ) => {
      this.linesSchedule = data;
      console.log(
        data
      );
    });   
    
  }

  toggleDropDown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.getSchedule();
      this.timerInterval = setInterval(() => {
        this.getSchedule();
      }, 30000);
    } else if (this.timerInterval != null){
      clearInterval(this.timerInterval);

    }
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }

}
