import { async, TestBed } from '@angular/core/testing';
import { IonicModule, Platform } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ConnectivityService } from '../providers/connectivity.service';
import { InfoService } from '../providers/info.service';
import { MyApp } from './app.component';
import { PlatformMock } from '../../test-config/mocks-ionic';

describe('MyApp Component', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyApp],
      imports: [
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot({name: 'test', storeName: 'test'})
      ],
      providers: [
        StatusBar,
        SplashScreen,
        ConnectivityService,
        InfoService,
        { provide: Platform, useClass: PlatformMock }
      ]
    });
  }));

  afterEach(() => {
    fixture.destroy();
    component = null;
    (<any> window).ga = undefined;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyApp);
    component = fixture.componentInstance;
  });

  it ('should be created', () => {
    expect(component instanceof MyApp).toBe(true);
  });

  it ('should have four pages', () => {
    expect(component.pages.length).toBe(4);
  });

});
