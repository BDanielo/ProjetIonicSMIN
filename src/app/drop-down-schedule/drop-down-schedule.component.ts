import { Component, Input, OnInit } from '@angular/core';
import { LineSchedule } from '../interfaces/line-schedule';

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
  @Input() linesSchedule: Array<LineSchedule> | undefined;

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
  
  color = this.lineColor[this.lineName];

  constructor() { }


  ngOnInit() {
    this.linesSchedule = [
      {
        "direction": "Grenoble Gare",
        "times": ["10:00", "10:30"]
      },
      {
        "direction": "Victor Hugo",
        "times": ["9:00", "10:30"]
      },
      {
        "direction": "Palais des Sports",
        "times": ["6:00", "10:30"]
      }
    ]
  }

  isOpen = false;
  isFavorite = false;

  toggleDropDown() {
    this.isOpen = !this.isOpen;
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }

}
