import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ConnectivityService } from '../../providers/connectivity.service';
import { RouteService } from '../../providers/route.service';
import { VehicleService } from '../../providers/vehicle.service';
import { Route } from '../../models/route.model';
import { Geolocation } from 'ionic-native';
import { Vehicle } from '../../models/vehicle.model';
import * as moment from 'moment';
import { MapService } from '../../providers/map.service';


declare var google;

@Component({
  selector: 'page-route-map',
  templateUrl: 'route-map.html'
})
export class RouteMapComponent {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  routeId: number;
  route: Route;
  interval: number;
  vehicles: Vehicle[];
  mapOptions = {
    center: new google.maps.LatLng(42.386270, -72.525844),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private routeService: RouteService, private vehicleService: VehicleService,
    private mapService: MapService, private connection: ConnectivityService) {
      this.routeId = navParams.get('routeId');
    }

  ionViewDidEnter(){
    this.loadMap();
    this.mapService.init(this.map);
    // $ionicLoading.show(ionicLoadingConfig);
    this.routeService
      .getRoute(this.routeId)
      .then(route => {
        if (!route) {
          return;
        }
        this.route = route;
        this.vehicles = route.Vehicles;
        this.mapService.addKML(route.RouteTraceFilename);
        this.placeVehicles(false);
        // $ionicLoading.hide();
      });
    this.interval = setInterval(() => {
      this.vehicleService
        .getRouteVehicles(this.routeId)
        .then(routeVehicles => {
          if (!routeVehicles) {
            return;
          }
          this.vehicles = routeVehicles;
          this.placeVehicles(true);
      });
    }, 30000);
  }
  ionViewCanEnter(): boolean {
   return this.connection.getConnectionStatus();
  }

  loadMap(){


    let latLng = new google.maps.LatLng(-34.9290, 138.6010);

    this.map = new google.maps.Map(this.mapElement.nativeElement, this.mapOptions);

  }

  placeVehicles (isVehicleRefresh) {
    //places every vehicle on said route on the map
      this.mapService.removeAllMarkers();
      if (!this.vehicles) {
        return;
      }
      for (let vehicle of this.vehicles) {
        let message;
        var loc = new google.maps.LatLng(vehicle.Latitude, vehicle.Longitude);

        //if the vehicle is on time, make the text green. If it's late, make the text red and say late by how much
        if (vehicle.DisplayStatus === 'On Time') {
          message = '<h4 style=\'color: green;\'>Bus ' + vehicle.Name + ' - ' + vehicle.DisplayStatus + '</h4>';
        }
        else {
          message = '<h4 style=\'color: red;\'>Bus ' + vehicle.Name + ' - ' + vehicle.DisplayStatus +
            ' by ' + vehicle.Deviation + ' minutes</h4>';
        }

        //sets the content of the window to have a ton of information about the vehicle
        var content = '<div style=\'font-family: Arial;text-align: center\'><h3 style=\'color: #' +
        this.route.Color + '\'>' + this.route.RouteAbbreviation + ': ' +
        vehicle.Destination + '</h3>' + message + '<h4>Last Stop: ' + vehicle.LastStop + '</h4>' +
        '<h4>Last Updated: ' + moment(vehicle.LastUpdated).format('h:mm:ss a') + '</h4></div>';
        // An bus-shaped icon, with the color of the current route and
        // rotated such that it is facing the same direction as the real bus.
        var icon = {
          path: this.mapService.busSVGPath(),
          fillColor: '#' + this.route.Color,
          fillOpacity: 1,
          strokeWeight: 1.5,
          scale: .04,
          // 180 degrees is rightside-up
          rotation: vehicle.Heading + 180
        };
        //add a listener for that vehicle with that content as part of the infobubble
        this.mapService.addMapListener(this.mapService.placeDesiredMarker(loc, icon, isVehicleRefresh), content);
      }
    }

}
