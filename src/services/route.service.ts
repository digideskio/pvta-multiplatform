import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Route } from '../models/route';
@Injectable()
export class RouteService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private routesURL = 'https://bustracker.pvta.com/InfoPoint/rest/routes/get';  // URL to web api
  constructor(private http: Http) { }
  getRoutes(): Promise<Route[]> {
    return this.http.get(`${this.routesURL}allroutes`)
               .toPromise()
               .then(response => response.json() as Route[])
               .catch(this.handleError);
  }
  getRoute(id: number): Promise<Route> {
    const url = `${this.routesURL}/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json() as Route)
      .catch(this.handleError);
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}