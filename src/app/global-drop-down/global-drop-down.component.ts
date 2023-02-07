import { DropDownScheduleComponent } from './../drop-down-schedule/drop-down-schedule.component';
import { StationsOfLine } from './../interfaces/stations-of-line';
import { TramStation } from './../interfaces/tram-station';
import { Component, Input, OnInit } from '@angular/core';



interface LineColor {
  [key: string]: string;
}

//import { DropDownScheduleComponent } from '../drop-down-schedule/drop-down-schedule.component';
@Component({
  selector: 'app-global-drop-down',
  templateUrl: './global-drop-down.component.html',
  styleUrls: ['./global-drop-down.component.scss']
})
export class GlobalDropDownComponent implements OnInit {

  @Input() lineName: string = "B";
  @Input() isAlert: boolean = false;
  @Input() tramStations: Array<TramStation> = [];

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
  
  color: string = "";
  

  constructor(
    ) { }


  ngOnInit() {
    this.color = this.lineColor[this.lineName];
  }

  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }

}
