import { Injectable } from '@angular/core';
declare var google;

@Injectable()
export class MapService {

  constructor() {}
  map;
  currentLocation;
  options = { timeout: 5000, enableHighAccuracy: true };
  markers = [];
  windows = [];

  placeDesiredMarker(location, icon, isVehicleRefresh): any {
    var neededMarker = new google.maps.Marker({
      map: this.map,
      icon: icon,
      animation: google.maps.Animation.DROP,
      position: location
    });
    if (!isVehicleRefresh) {
      this.map.panTo(location);
    }
    this.markers.push(neededMarker);
    return neededMarker;
  }

  removeAllMarkers(): void {
    for (let marker of this.markers) {
      marker.setMap(null);
    }
    this.markers = [];
  }

  // plotCurrentLocation(cb): void {
  //   $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
  //     currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  //     addMapListener(placeDesiredMarker(currentLocation, 'https://www.google.com/mapfiles/kml/paddle/red-circle.png'),
  //       "<h4 style='color: #387ef5'>You are here!</h4>");
  //     if (cb) {
  //       cb(currentLocation);
  //     }
  //   }, function (err) {
  //     showInsecureOriginLocationPopup(err);
  //     // Tell Google Analytics that a user doesn't have location
  //     ga('send', 'event', 'LocationFailure', '$cordovaGeolocation.getCurrentPosition', 'location failed in the Map Factory; error: ' + err.message);
  //     if (cb) {
  //       cb(false);
  //     }
  //   });
  //   return currentLocation;
  // }

   addMapListener (marker, onClick) {
    google.maps.event.addListener(marker, 'click', () => {
      //this auto-closes any bubbles that may already be open
      //when you open another one, so that only one bubble can
      //be open at once
      for (let window of this.windows) {
        window.close();
      }
      this.windows = [];
      // Create the new InfoWindow, and show it!
      let infoWindow = new google.maps.InfoWindow({
        content: onClick
      });
      this.windows.push(infoWindow);
      infoWindow.open(this.map, marker);
    });
  }

  addKML (fileName) {
    let toAdd = 'https://bustracker.pvta.com/infopoint/Resources/Traces/' + fileName;
    let georssLayer = new google.maps.KmlLayer({
      url: toAdd
    });
    georssLayer.setMap(this.map);
  }

  // getCurrentPosition () {
  //   return $cordovaGeolocation.getCurrentPosition(options);
  // }

  init(incomingMap): void {
    this.map = incomingMap;
  }
  // A well-known svg 'path.' When rendered, it draws a bus!
  busSVGPath(): string {
    return "M842.998 448h-655.77c-19.108 0-34.836 16.425-34.836 35.103 0 3.113 0.573 6.636 1.208 9.462l34.898 243.692c2.97 15.831 17.224 18.944 34.284 18.944h584.765c16.937 0 31.314-2.847 34.243-18.616l34.898-248.136c0.532-2.888 1.229-4.588 1.229-7.7-0.020-18.678-15.831-32.748-34.918-32.748zM816.763 174.694c-36.925 0-66.867 29.061-66.867 65.29 0 35.983 29.942 65.004 66.867 65.004 36.68 0 66.683-29.020 66.683-65.004 0-36.229-30.003-65.29-66.683-65.29zM212.582 174.694c-36.659 0-66.621 29.061-66.621 65.29 0 35.983 29.962 65.004 66.621 65.004 37.028 0 66.929-29.020 66.929-65.004 0-36.229-29.901-65.29-66.929-65.29zM327.68 898.56h409.6v-61.44h-409.6c-40.96 0-40.96 61.44 0 61.44zM905.257 804.557c-11.96 57.61-46.899 80.814-103.895 103.997-56.893 23.101-188.744 50.79-287.908 50.79-99.594 0-232.12-27.709-289.075-50.79-56.975-23.204-91.341-46.387-103.199-103.997l-39.26-320.696v-445.46h61.44v-40.96c0-81.92 102.4-81.92 102.4 0v40.96h512v-40.96c0-81.92 122.88-81.92 122.88 0v40.96h61.44v445.46l-36.823 320.696z";
  }

}