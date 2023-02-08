import { Favorite } from './../interfaces/favorite';
import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { MTAGAPIService } from '../services/mtag-api.service';

const select = "selected"
@Component({
  selector: 'app-itineary-page',
  templateUrl: './itineary-page.page.html',
  styleUrls: ['./itineary-page.page.scss'],
})
export class ItinearyPagePage implements OnInit {


  constructor(
    public MtagService: MTAGAPIService,
    public navCtrl: NavController
  ) { }

  isFav = true;
  classSelectionFav = select;
  classSelectionRecent = "";

  //init favorites with value
  favorites: Favorite [] = [
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "A",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "B",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    },
    {
      name: "Gare de Lyon",
      stationId: "GDL",
      line: "C",
      type: "metro",
      lat: 48.844,
      lon: 2.374
    }
  ]

  ngOnInit() {
  }

  goToMap() {
    this.navCtrl.navigateForward('/tabs/tab1');
  }

  toggleQuickSearchFav(){
      this.classSelectionRecent = "";
      this.classSelectionFav = select;
      this.isFav = true;
  }

  toggleQuickSearchRecent(){
    this.classSelectionFav = "";
    this.classSelectionRecent = select;
    this.isFav = false;
}

  search() {
    throw new Error('Method not implemented.');
  }

  favSelected(fav: Favorite) {
    throw new Error('Method not implemented.');
  }

}
