angular.module('pvta.controllers').controller('AboutController', function ($scope, $window, Info) {
  ga('set', 'page', '/about.html');
  ga('send', 'pageview');
  $scope.vNum = Info.versionNum;
  $scope.vName = Info.versionName;
});
