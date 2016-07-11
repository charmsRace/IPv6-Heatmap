(function() {
    'use strict';
    
    var angular = require('angular');
    
    require('./vendor/angular-route/angular-route.js');
    require('./vendor/restangular/dist/restangular.js');
    var _ = require('lodash');
    
    //require('./js/main.ctrl.js');
    
    console.log('past req');
    
    angular.module('iphm', [
        'iphm.view',
        'ngRoute',
        'restangular',
    ]);
    
    angular
        .module('iphm')
        .config(routeConfig);
    
    routeConfig.$inject = [
        '$routeProvider',
        '$locationProvider',
        'RestangularProvider'
    ];
    
    function routeConfig($routeProvider, $locationProvider, RestangularProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/views/home.html',
                controller: 'MainCtrl',
                controllerAs: 'mainCtrl'
            })
            .when('/view1', {
                templateUrl: '/views/v1.html',
                controller: 'SubCtrl',
                controllerAs: 'subCtrl1'
            })
            .when('/view2', {
                templateUrl: '/views/v2.html',
                controller: 'SubCtrl',
                controllerAs: 'subCtrl2'
            })
            .otherwise({
                redirectTo: '/'
            });
        RestangularProvider.setBaseUrl('/api/v1');
        RestangularProvider.setRestangularFields({
            id: '_id'
        });
        $locationProvider.html5Mode(true);
    }
    
    angular
        .module('iphm.view', [])
        .controller('MainCtrl', MainCtrl);
    
    MainCtrl.$inject = [
        '$rootScope',
    ];
    
    function MainCtrl($rootScope) {
        this.tagline = 'foo!';
    }
    
    angular
        .module('iphm.view')
        .controller('SubCtrl', SubCtrl);
    
    SubCtrl.$inject = [
        '$rootScope',
    ];
    
    function SubCtrl($rootScope) {
        this.tagline = 'bar!';
    }
    
    
    
}());
