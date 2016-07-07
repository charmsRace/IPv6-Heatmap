console.log('test');

console.log('test2');

var angular = require('angular');

require('./lib/angular-route/angular-route.js');
require('./js/factory');
require('./js/controllers');

angular
    .module('iphm', [
        'ngRoute',
        'iphm.factory',
        'iphm.controllers'
    ])
    .config(function($routeProvider) {
      $routeProvider
          .when('/', {
              templateUrl: 'partials/todo.html',
              controller: 'TodoCtrl'
          })
          .otherwise({
              redirectTo: '/'
          });
    });
