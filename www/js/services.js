angular.module('pvta.services', ['ngResource'])

.factory('Avail', function(){
  return 'http://bustracker.pvta.com/infopoint/rest';
})

.factory('Vehicle', function ($resource, Avail) {
    return $resource(Avail + '/vehicles/get/:vehicleId');
})

.factory('Route', function ($resource, Avail) {
    return $resource(Avail + '/routedetails/get/:routeId');
})

.factory('Routes', function ($resource, Avail) {
    return $resource(Avail + '/routes/getvisibleroutes');
})

.factory('NearestStops', function($resource, Avail){
    return $resource(Avail + '/Stops/Nearest?latitude=:latitude&longitude=:longitude', {latitude: "@latitude", longitude: "@longitude"})
})

.factory('Stop', function ($resource, Avail) {
    return $resource(Avail + '/stops/get/:stopId');
})

.factory('Stops', function ($resource, Avail){
    return $resource(Avail + '/stops/getallstops');
})

.factory('RouteVehicles', function ($resource, Avail){
    return $resource(Avail + '/vehicles/getallvehiclesforroute?routeid=:id')
})

.factory('StopDeparture', function ($resource, Avail) {
    return $resource(Avail + '/stopdepartures/get/:stopId');
})

.factory('Messages', function ($resource, Avail) {
  return $resource(Avail + '/publicmessages/getcurrentmessages');
})

.factory('SimpleRoute', function ($resource, Avail){
  return $resource(Avail + '/routes/get/:routeId');
})

.factory('Info', function(){
  return {
    versionNum: '0.5.2',
    versionName: 'Beta 2'
  };
})



.factory('StopList', function(){
  var stopsList = [];

  var pushEntireList = function(list){
    stopsList = stopsList.concat(_.uniq(list, true, 'Name'));
    return stopsList;
  };

  var getEntireList = function(){
    if(stopsList !== undefined){
      return stopsList;
    }
    else return 0;
  };

  var isEmpty = function(){
    if(stopsList.length === 0) return true;
    else return false
  };

  return {
    pushEntireList: pushEntireList,
    getEntireList: getEntireList,
    isEmpty: isEmpty,
  };

})

.factory('RouteList', function(){
  var routesList = [];

  var pushEntireList = function(list){
   // only store the route attributes we need
   routesList = _.map(list, function(route){
     return _.pick(route, 'ShortName', 'LongName', 'Color', 'RouteId');
   });
   // sort routes by their number
   var routeNumber = /\d{1,2}/;
   routesList = _.sortBy(routesList, function(route){
     matches = route.ShortName.match(routeNumber)
     return Number(_.first(matches));
   });
   return routesList;
  };

  var getEntireList = function(){
    if(!isEmpty()) {
      return routesList;
    }
    else return 0;
  }

  var isEmpty = function(){
    if(routesList.length == 0) return true;
    else return false
  };

  return {
    pushEntireList: pushEntireList,
    getEntireList: getEntireList,
    isEmpty: isEmpty
  };

})

.factory('FavoriteRoutes', function(){
  var routes = [];
  var push = function(route){
    localforage.getItem('favoriteRoutes', function(err, value){
      var newArray = [];
      if(value !== null) {
        newArray = value;
        newArray.push(route);
      }
      else{
        newArray.push(route);
      }
      localforage.setItem('favoriteRoutes', newArray, function(err, value){
      })
    })
  };

  var getAll = function(){
    var ret = [];
    localforage.getItem('favoriteRoutes', function(err, value){

    })
  };

  var remove = function(route){
    localforage.getItem('favoriteRoutes', function(err, routes){
      for(var i = 0; i < routes.length; i++){
        if(routes[i].RouteId === route.RouteId) {
          routes.splice(i, 1);
        }
      }
      localforage.setItem('favoriteRoutes', routes, function(err, newRoutes){
      });
    });
    removeOneRoute(route);
  };

  var removeOneRoute = function(route){
    var name = 'Route ' + route.ShortName + ' favorite';
    localforage.removeItem(name, function(err){
      if(err) console.log(err);
    });
  };

  return{
    push: push,
    getAll: getAll,
    remove: remove
  };
})

.factory('FavoriteStops', function(){
  var stops = [];
  var push = function(stop){
    localforage.getItem('favoriteStops', function(err, value){
      var newArray = [];
      if(value !== null) {
        newArray = value;
        newArray.push(stop);
      }
      else{
        newArray.push(stop);
      }
      localforage.setItem('favoriteStops', newArray, function(err, value){
      });
    });
  };

  var getAll = function(){
    var ret = [];
    localforage.getItem('favoriteStops', function(err, value){
    });
  };

  var remove = function(stop){
    localforage.getItem('favoriteStops', function(err, stops){
      for(var i = 0; i < stops.length; i++){
        if(stops[i].StopId === stop.StopId) {
          stops.splice(i, 1);
        }
      }
      localforage.setItem('favoriteStops', stops, function(err, newStops){
      });
    });

    //Since stops also have their own separate entries,
    // (for toggling the heart on the Stop's page),
    // remove that too.
    removeOneStop(stop);
  };

  var removeOneStop = function(stop){
    var name = 'Stop ' + stop.Name + " favorite";
    localforage.removeItem(name, function(err){
      if(err) console.log(err);
    });
  }

  return{
    push: push,
    getAll: getAll,
    remove: remove
  };
})

.factory('KML', function(){
  var kml = [];
  function push(shortName){
    kml.push(shortName);
  };
  function pop(){
    if(kml.length == 1){
      return kml.pop();
    }
    else{
      // Empty the array,
      // because anything else
      // will produce undesired
      // activity in MapController
      kml = [];
      return null;
    }
  }
  return {
    push: push,
    pop: pop
  };
})

.service('LatLong', function(){
  var latlong = [];
  return {
    push: function(lat, long){
      var p = {lat, long};
      latlong.push(p);
    },
    getAll: function(){
      if(latlong.length > 0){
        var toReturn = latlong;
        latlong = [];
        return toReturn;
      }
      else {
        return null;
      }
    }
  };
})

.factory('Map', function($cordovaGeolocation){

  var map;
  var bounds;
  var currentLocation;
  var options = {timeout: 5000, enableHighAccuracy: true};

  function placeDesiredMarker(location, icon){
    var neededMarker = new google.maps.Marker({
        map: map,
        icon: icon,
        animation: google.maps.Animation.DROP,
        position: location
      });
      bounds.extend(location);
      map.fitBounds(bounds);
    return neededMarker;
  };

  function plotCurrentLocation(cb){
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      addMapListener(placeDesiredMarker(currentLocation, 'http://www.google.com/mapfiles/kml/paddle/red-circle.png'), 'You are here!');
      if(cb) { cb(currentLocation); }
    }, function(){});
    return currentLocation;
  };

  function addMapListener(marker, onClick){
    google.maps.event.addListener(marker, 'click', function () {
            var infoWindow = new google.maps.InfoWindow({
              content: onClick
            });
            infoWindow.open(map, marker);
    });
  }


  return {
    placeDesiredMarker: placeDesiredMarker,
    init: function(incomingMap, incomingBounds){
      map = incomingMap;
      bounds = incomingBounds;
    },
    plotCurrentLocation: plotCurrentLocation,
    addMapListener: addMapListener
  }
})

.factory('Recent', function(moment){
  function recent(timestamp){
    var now = moment();
    var diff = now.diff(timestamp, 'days');
    if (diff <= 5) return true;
    else return false;
  };
  return {
    recent: recent
  };
})

.factory('RouteForage', function(RouteList, moment, Recent, Routes, $q){
  function getRouteList(){
    if(RouteList.isEmpty()){
      return localforage.getItem('routes').then(function(routes){
        if(routes && (Recent.recent(routes.time))){
          return routes.list;
        }
        else {
          return Routes.query().$promise;
        }
      });
    }
    else return $q.when(RouteList.getEntireList());
  };
  function saveRouteList(list){
    if(RouteList.isEmpty()) {
      RouteList.pushEntireList(list);
    }
    pushListToForage(list);
  }
  function pushListToForage(routes){
    var toForage = {
      list: routes,
      time: moment()
    }
    localforage.setItem('routes', toForage, function(err, val){if (err) console.log(err)});
  }
  return {
    get: getRouteList,
    save: saveRouteList
  };
})

.factory('StopsForage', function(StopList, Recent, Stops, NearestStops, $q){
  function getStopList(lat, long){
    if(StopList.isEmpty()){
      return localforage.getItem('stops').then(function(stops){
        if(stops && (Recent.recent(stops.time))){
          return stops.list;
        }
        else {
          if(lat && long) {
            return NearestStops.query({latitude: lat, longitude: long}).$promise;
          }
          else {
            return Stops.query().$promise;
          }
        }
      });
    }
    else return $q.when(StopList.getEntireList());
  };
  function saveStopList(list){
    if(StopList.isEmpty()) {
      StopList.pushEntireList(list);
    }
    pushListToForage(list);
  }
  function pushListToForage(stops){
    var toForage = {
      list: stops,
      time: moment()
    }
    localforage.setItem('stops', toForage, function(err, val){if (err)console.log(err);});
  }
  return {
    get: getStopList,
    save: saveStopList
  };
})
