angular.module('pvta.controllers').controller('RoutesAndStopsController', function ($scope, $ionicFilterBar, $cordovaGeolocation, RouteForage, StopsForage, $ionicLoading, $stateParams, $state, FavoriteStops, FavoriteRoutes) {
  ga('set', 'page', '/routes-and-stops.html');
  ga('send', 'pageview');
  var primarySort = '-Liked';
  var secondarySort = 'RouteAbbreviation';
  $scope.propertyName = [primarySort, secondarySort];
  $scope.order = 'name';
  // We can control which list is shown via the page's URL.
  // Pull that param and same it for later.
  $scope.currentDisplay = parseInt($stateParams.segment);
  $scope._ = _;

  /*
  *  Two redirect functions, which are called
  *  when clicking on the ion-items in the lists.
  *  These are necessary so that we can use
  *  $event.stopPropagation() in the directive
  *  (see directives/route/route-directive.html
  *  or directives/stop/stop-directive.html for
  *  more info about $event.stopPropagation())
  */

  $scope.redirectRoute = function (routeId) {
    $state.go('app.route', {routeId: routeId});
  };

  $scope.redirectStop = function (stopId) {
    $state.go('app.stop', {stopId: stopId});
  };

  /*
   * Get all the routes and stops
   */

  function getRoutesAndStops () {
    $ionicLoading.show();
    // RouteForage returns a promise, resolve it.
    RouteForage.get().then(function (routes) {
      RouteForage.save(routes);
      getFavoriteRoutes(routes);
      redraw();
    });
    /*
     * Remember, StopsForage returns a Promise.
     * Must resolve it.
     */
    StopsForage.get().then(function (stops) {
      stops = StopsForage.uniq(stops);
      StopsForage.save(stops);
      getFavoriteStops(stops);
      redraw();
      $ionicLoading.hide();
    });
  }
  /*
   * Given the list of route objects, this function removes properties
   * that we don't care about and adds whether each route is favorited.
   *
   * IMPORTANT: before this function is called, $scope.favoriteRoutes
   * must already be populated!
   */
  function prepareRoutes (routeList) {
    // For each route, add the custom 'Liked' property and keep only
    // the properties we care about.  Doing this makes searching easier.
    return _.map(routeList, function (route) {
      route.Liked = _.contains(_.pluck($scope.favoriteRoutes, 'RouteId'), route.RouteId);
      return _.pick(route, 'RouteId', 'RouteAbbreviation', 'LongName', 'ShortName', 'Color', 'GoogleDescription', 'Liked');
    });
  }

  /*
   * Similar to prepareRoutes (see above), we only
   * keep the details about each stop that are useful
   * to us for displaying them.
   */
  function prepareStops (stopList) {
    return _.map(stopList, function (stop) {
      stop.Liked = _.contains(_.pluck($scope.favoriteStops, 'StopId'), stop.StopId);
      return _.pick(stop, 'StopId', 'Name', 'Liked', 'Description');
    });
  }

  // Two variables for the lists.
  $scope.routesDisp = [];
  $scope.stopsDisp = [];

  /* Decides which list to display.
   * Takes an index (0 or 1) and assigns
   * the appropriate variables.
   */
  $scope.display = function (index) {
    /* Set the controller-wide
     * variable to indicate
     * which type of data is being displayed.
     * This is useful when searching.
     */
    $scope.currentDisplay = index;
    /* Fill the $scope variable for
     * the proper list and clear out
     * the ones for the other list.
     */
    switch (index) {
      case 0:
        $scope.stopsDisp = null;
        $scope.routesDisp = $scope.routes;
        break;
      case 1:
        $scope.routesDisp = null;
        $scope.stopsDisp = $scope.stops;
        break;
    }
    $scope.toggleOrdering();
  };

  /* When the search button is clicked onscreen,
   * this function is called. The library, in the background,
   * takes care of some things for us, like tracking the input text.
   * The key here is to determine whether we're
   * trying to search stops or routes.
   */
  $scope.showFilterBar = function () {
    var itms;
    // itms is the variable we'll be searching.
    // If routes are displayed, imts is routes.
    // Else, it's stops.
    if ($scope.currentDisplay === 0) {
      itms = $scope.routesDisp;
    }
    else {
      itms = $scope.stops;
    }
    filterBarInstance = $ionicFilterBar.show({
      // tell $ionicFilterBar to search over itms.
      items: itms,
      // Every time the input changes, update the results.
      update: function (filteredItems) {
        // if routes are currently being displayed, update
        // their list with our results here.
        if ($scope.currentDisplay === 0) {
          $scope.routesDisp = filteredItems;
        }
        else {
          // otherwise, update the stops list.
          $scope.stopsDisp = filteredItems;
        }

      }
    });
  };

  function getFavoriteRoutes (routes) {
    localforage.getItem('favoriteRoutes', function (err, value) {
      $scope.favoriteRoutes = value;
      $scope.routes = prepareRoutes(routes);
      redraw();
    });
  }

  function getFavoriteStops (stops) {
    localforage.getItem('favoriteStops', function (err, value) {
      $scope.favoriteStops = value;
      $scope.stops = prepareStops(stops);
      redraw();
    });
  }
  /*
   * Switches between the two ways Routes and Stops can be ordered.
   */
  $scope.toggleOrdering = function () {
    // If routes are currently in view
    if ($scope.currentDisplay === 0) {
      // If we're currently ordering by favorites, switch to name.
      if ($scope.order === 'name') {
        primarySort = 'RouteAbbreviation';
      }
      // If we're currently ordering by name, switch to favorites.
      else if ($scope.order === 'favorites') {
        primarySort = '-Liked';
      }
      else {
        primarySort = '-Liked';
      }
      // Make sure the secondary dimension for ordering is always name.
      secondarySort = 'RouteAbbreviation';
    }
    // If stops are currently in view
    else if ($scope.currentDisplay === 1) {
      // If we're currently ordering by favorites, switch to name.
      if ($scope.order === 'name') {
        primarySort = 'Description';
      }
      // If we're currently ordering by name, switch to favorites.
      else if ($scope.order === 'favorites') {
        primarySort = '-Liked';
      }
      else {
        primarySort = '-Liked';
      }
      // Make sure the secondary dimension for ordering is always name.
      secondarySort = 'Description';
    }
    // Assign the new ordering to the controller-wide filter.
    $scope.propertyName = [primarySort, secondarySort];
  };

  /*
   * Called when a user clicks on the heart button,
   * this function either removes or adds
   * the stop to the user's list of favorites.
   */
  $scope.toggleStopHeart = function (stop) {
    FavoriteStops.contains(stop.StopId, function (bool) {
      if (bool === true) {
        FavoriteStops.remove(stop);
      }
      else {
        FavoriteStops.push(stop);
      }
      $scope.$apply();
    });
  };

  /*
   * Called when a user clicks on the heart button,
   * this function either removes or adds
   * the route to the user's list of favorites.
   */
  $scope.toggleRouteHeart = function (route) {
    FavoriteRoutes.contains(route, function (bool) {
      if (bool === true) {
        FavoriteRoutes.remove(route);
      }
      else {
        FavoriteRoutes.push(route);
      }
      $scope.$apply();
    });
  };

  function redraw () {
    $scope.display($scope.currentDisplay);
  }

  $scope.$on('$ionicView.enter', function () {
    getRoutesAndStops();
    redraw();
  });
});
