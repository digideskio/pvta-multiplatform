import { Component, ViewChild } from '@angular/core';
import { Nav, Platform} from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import localforage from "localforage";
import { Storage } from '@ionic/storage';
import { MyBusesComponent } from '../pages/my-buses/my-buses.component';
import { PlanTripComponent } from '../pages/plan-trip/plan-trip.component';
import { RoutesAndStopsComponent } from '../pages/routes-and-stops/routes-and-stops.component';
import { SettingsComponent } from '../pages/settings/settings.component';
import { ConnectivityService } from '../providers/connectivity.service';
import { InfoService } from '../providers/info.service';

declare var ga;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = MyBusesComponent;
  offlineToast;
  pages: Array<{title: string, component: any}>;
  showNativeStoreAd = false;

  constructor(public platform: Platform, private infoSvc: InfoService,
  private connectivityService: ConnectivityService, private storage: Storage) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'My Buses', component: MyBusesComponent },
      { title: 'Routes and Stops', component: RoutesAndStopsComponent },
      { title: 'Schedule', component: PlanTripComponent },
      { title: 'Settings', component: SettingsComponent }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      console.log('initializeApp');
      StatusBar.styleDefault();
      if (this.platform.is('android')) {
        StatusBar.backgroundColorByHexString('#1976D2');
      }
      let isIE: boolean = navigator.userAgent.indexOf('Trident', 0) !== -1;
      this.infoSvc.setInternetExplorer(isIE);
      this.showNativeStoreAd = this.platform.is('mobileweb') || this.platform.is('core');
      Splashscreen.hide();
      // Must use document for pause/resume, and window for on/offline.
      // Great question.
      document.addEventListener('pause', this.onAppPause);
      document.addEventListener('resume', this.onAppResume);
      window.addEventListener('offline', this.onDeviceOffline, false);
      window.addEventListener('online', this.onDeviceOnline, false);
    });
    //if (this.showNativeStoreAd) {
      this.getOldFavorites();
    //}
  }

  getOldFavorites(): void {
    // The same code, but using ES6 Promises.
    this.storage.ready().then(() => {
      console.log(this.storage.driver);
      if (this.storage.driver === 'sqlite' || this.storage.driver === 'cordovaSQLiteDriver') {
        localforage.iterate((value, key, iterationNumber) => {
          // Resulting key/value pair -- this callback
          // will be executed for every item in the
          // database.
          console.log([key, value]);
          this.storage.set(key, value);
        }).then(() =>{
          console.log('Iteration has completed');
          localforage.clear();
        }).catch((err) => {
          // This code runs if there were any errors
          console.log(err);
        });
      }
    });
  }

  onAppPause = () => {
    console.log('App: pause');
    window.removeEventListener('offline', this.onDeviceOffline);
    window.removeEventListener('online', this.onDeviceOnline);
  }
  onAppResume = () => {
    console.log('App: resume');
    window.addEventListener('offline', this.onDeviceOffline, false);
    window.addEventListener('online', this.onDeviceOnline, false);
  }
  onDeviceOffline = () => {
    console.log('App: offline');
    this.connectivityService.setConnectionStatus(false);
  }
  onDeviceOnline = () => {
    console.log('App: online');
    this.connectivityService.setConnectionStatus(true);
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
