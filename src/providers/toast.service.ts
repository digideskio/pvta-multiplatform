import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class ToastService {
    private faveToast;
    private noLocationToast;
    private directToast;
    private directionStatus;
    private originDestination;
    constructor(private toast: ToastController) { }

  toastHander(text: string){
		let txt = text;
		this.toastHandle = this.toast.create({message: txt, position: 'bottom', showCloseButton: true});
		this.toastHandle.present();
  }
  favoriteToast(routeOrStop: string, isFave: boolean): void {
    if (this.faveToast) {
      this.faveToast.dismiss();
    }
    let txt = `${routeOrStop} ${isFave ? 'added to' : 'removed from'} Favorites`;
    this.faveToast = this.toast.create({message: txt, position: 'bottom', showCloseButton: true});
    this.faveToast.present();
  }
  noOriginOrDestinationToast(): void{
    let txt = 'You must select an origin and destination from the autocomplete dropdowns above in order to search the schedule';
    this.originDestination = this.toast.create({message: txt, position: 'bottom', showCloseButton: true});
    this.originDestination.present();
  }
}
