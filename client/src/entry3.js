(function() {
    'use strict';
    
    var angular = require('angular');
    
    require('angular-resource');
    require('./vendor/angular-route/angular-route.js');
    var leaflet = require('leaflet');
    require('./vendor/leaflet-heat/leaflet-heat.js');
    require('angular-leaflet-directive');
    
    //require('./js/main.ctrl.js');
    
    console.log('past req');
    
    angular.module('iphm', [
        'iphm.view',
        'iphm.map',
        'ngRoute',
        'leaflet-directive'
    ]);
    
    angular
        .module('iphm')
        .config(routeConfig);
    
    routeConfig.$inject = [
        '$routeProvider',
        '$locationProvider'
    ];
    
    function routeConfig($routeProvider, $locationProvider) {
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
            .when('/map', {
                templateUrl: '/views/map.html',
                controller: 'MapCtrl',
            })
            .when('/bounds', {
                templateUrl: '/views/bounds.html',
                controller: 'BoundsCtrl',
            })
            .otherwise({
                redirectTo: '/'
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
    
    angular
        .module('iphm.map', [
            // ?
        ])
        .controller('MapCtrl', MapCtrl);
    
    MapCtrl.$inject = [
        '$scope',
        '$http',
        // db
    ];
    
    function MapCtrl($scope, $http) {
        var url = 'http://api.mapbox.com/v4/{map_id}'
            + '/{z}/{x}/{y}{@2x}.{format}?access_token={apikey}';
        var map_id = 'mapbox.streets';
        var highDPI = false;
        var format = 'png'; // or 'grid.json' or 'vector.pbf'
        var apikey = 'pk.eyJ1IjoiY2FsYW1pdGl6ZXIiLCJhIjoiY2lxaTQzcm5iMDVoemZ5bnB6NXdpYnVlNyJ9.HGpHUJPiNRP75L5SaCZV5Q';

        angular.extend($scope, {
            center: {
                lat: 37.774546,
                lng: -122.433523,
                zoom: 12
            },
            layers: {
                baselayers: {
                    mapboxStreets: {
                        name: 'Mapbox Streets',
                        url: 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY2FsYW1pdGl6ZXIiLCJhIjoiY2lxaTQzcm5iMDVoemZ5bnB6NXdpYnVlNyJ9.HGpHUJPiNRP75L5SaCZV5Q',
                        type: 'xyz'
                    }
                }
            }
        });
        
        $http
            .get('/json/heat-test.json')
            .success(function(data) {
                console.log(data);
                $scope.layers.overlays = {
                    heat: {
                        name: 'Heatmap',
                        type: 'heat',
                        data: data,
                        layerOptions: {
                            radius: 1000,
                            blur: 10
                        },
                        visible: true
                    }
                };
            });
    }
    
    var url = '/api/v0.1/coord-freqs?llng=:llng?rlng=:rlng?dlat=:dlat?ulat=:ulat'
    
    
    
    var url = 'https://api.mapbox.com/v4/:mapid/:z/:x/:y:highDPI.:format?access_token=:apikey';
    
    angular
        .module('iphm.map')
        .controller('BoundsCtrl', BoundsCtrl);
    
    BoundsCtrl.$inject = [
        '$scope',
        '$http',
        'leafletData',
        'leafletBoundsHelpers'
    ];
    
    function BoundsCtrl($scope, $http, leafletData, leafletBoundsHelpers) {
        var url = 'http://api.mapbox.com/v4/{map_id}'
            + '/{z}/{x}/{y}{@2x}.{format}?access_token={apikey}';
        var map_id = 'mapbox.streets';
        var highDPI = false;
        var format = 'png'; // or 'grid.json' or 'vector.pbf'
        var apikey = 'pk.eyJ1IjoiY2FsYW1pdGl6ZXIiLCJhIjoiY2lxaTQzcm5iMDVoemZ5bnB6NXdpYnVlNyJ9.HGpHUJPiNRP75L5SaCZV5Q';

         var bounds = leafletBoundsHelpers.createBoundsFromArray([
            [ 51.508742458803326, -0.087890625 ],
            [ 51.508742458803326, -0.087890625 ]
        ]);
        
        angular.extend($scope, {
            bounds: bounds,
            center: {}
        });
        
        $http
            .get('../json/heat-test.json')
            .success(function(data) {
                console.log('aaaaaaaaaaaaaaaaaa');
                $scope.layers.overlays = {
                    heat: {
                        name: 'Heatmap',
                        type: 'heat',
                        data: data,
                        layerOptions: {
                            radius: 20,
                            blur: 10
                        },
                        visible: true
                    }
                };
            });
        
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}());
