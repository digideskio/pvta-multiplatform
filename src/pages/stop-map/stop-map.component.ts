import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import {Geolocation} from 'ionic-native';
import { Stop } from '../../models/stop.model';
import { MapService } from '../../providers/map.service';
import { StopService } from '../../providers/stop.service';
import { ConnectivityService } from '../../providers/connectivity.service';

declare var google;

@Component({
  selector: 'page-stop-map',
  templateUrl: 'stop-map.html'
})
export class StopMapComponent {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('directions') directionsElement: ElementRef;
  map: any;
  directionsDisplay: any;
  stopId: number;
  stop: Stop;
  directionsRequested: boolean = false;
  directionsObtained: boolean = false;
  mapHeight: string = '100%';
  loader: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private stopSvc: StopService, private mapSvc: MapService, private zone: NgZone,
    private toastCtrl: ToastController, private connection: ConnectivityService,
    private loadingCtrl: LoadingController) {
    this.stopId = navParams.get('stopId');
  }
  directionsService = new google.maps.DirectionsService();

  ionViewDidEnter() {
    let mapOptions = {
      center: new google.maps.LatLng(42.386270, -72.525844), // Haigis Mall
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      }
    };
    this.presentLoader();
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.mapSvc.init(this.map);
    // Be ready to display directions if the user requests them.
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.directionsDisplay.setMap(this.map);
    // Download the stop details and plot it on the map.
    this.stopSvc.getStop(this.stopId).then(stop => {
      this.stop = stop;
      this.placeStop(stop);
      this.hideLoader();
    }).catch(err => {
      console.error(err);
    });
  }

  ionViewCanEnter(): boolean {
    return this.connection.getConnectionStatus();
  }

  presentLoader(): void {
    this.loader = this.loadingCtrl.create({
      content: 'Mapping Stop...',
      duration: 3000
    });
    this.loader.present();
  }

  hideLoader(): void {
    if (this.loader) {
      this.loader.dismiss();
    }
  }

  /****
  * Plots a stop on the map.  When clicked, the marker
  * will display a popup that gives some details about the stop.
  * Stop data needs to already have been loaded before this
  * function will succeed.
  */
  placeStop(stop: Stop): void {
    let loc = new google.maps.LatLng(stop.Latitude, stop.Longitude);
    let marker = this.mapSvc.dropPin(loc);
    this.mapSvc.addMapListener(marker, `${stop.Description} (${stop.StopId})`);
  }

  /***
   * Gets directions from the user's current location
   * to the stop in question and displays them on the UI.
  */
  calculateDirections(): void {
    this.directionsRequested = true;
    this.directionsObtained = false;
    this.mapHeight = '90%';
    Geolocation.getCurrentPosition().then(position => {
      // If we have a location, download and display directions
      // from here to the stop.
      this.directionsDisplay.setPanel(this.directionsElement.nativeElement);
      var request = {
        origin: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
        destination: new google.maps.LatLng(this.stop.Latitude, this.stop.Longitude),
        travelMode: google.maps.TravelMode.WALKING
      };
      this.getDirections(request);
    }).catch(err => {
      console.log('Unable to get current location');
      this.directionsObtained = false;
      this.directionsRequested = false;
      this.toastCtrl.create({
        message: 'Cannot get directions to this stop. Please ensure location services are enabled.',
        position: 'bottom',
        showCloseButton: true
      }).present();
      // Tell Google Analytics that a user doesn't have location
      // ga('send', 'event', 'LocationFailure', '$cordovaGeolocation.getCurrentPosition', 'location failure passed to Stop Map after failing on Map Factory');
    });
  }

  getDirections(request): void {
    this.directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsDisplay.setDirections(result);
        // Use NgZone to trigger change detection for events that brought us
        // us outside Angular's detection zone, like this directions request
        this.zone.run(() => {
          this.mapHeight = '50%';
          this.directionsObtained = true;
          google.maps.event.trigger(this.map, 'resize');
        });
      } else {
        this.directionsObtained = false;
        this.directionsRequested = false;
        this.toastCtrl.create({
          message: `Couldn't get directions to this stop. Status code ${status}`,
          position: 'bottom',
          showCloseButton: true
        }).present();
      }
    });
  }
}
