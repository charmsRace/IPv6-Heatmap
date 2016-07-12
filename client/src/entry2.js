(function() {
    'use strict';
    
    var angular = require('angular');
    
    require('angular-resource');
    require('./vendor/angular-route/angular-route.js');
    var leaflet = require('leaflet');
    require('./vendor/leaflet-heat/leaflet-heat.js');
    require('angular-leaflet-directive');
    
    // require all '*.module.js'
    
    console.log('past req');
    
    angular
        .module('iphm', [
            // 'iphm.cf',
            'iphm.view',
            'iphm.map',
            'iphm.resources',
            'ngRoute',
            'leaflet-directive'
        ])
        .config(routeConfig);
        
    routeConfig.$inject = [
        '$routeProvider',
        '$locationProvider'
    ];
    
    function routeConfig($routeProvider, $locationProvider) {
        console.log('configged');
        $routeProvider
            .when('/', {
                templateUrl: '/views/home.html',
                controller: 'FrameCtrl',
                controllerAs: 'frameCtrl'
            })
            .when('/api', {
                templateUrl: '/views/apispec.html',
                controller: 'FrameCtrl',
                controllerAs: 'frameCtrl'
            })
            .when('/spec', {
                templateUrl: '/views/spec.html',
                controller: 'FrameCtrl',
                controllerAs: 'frameCtrl'
            })
            .when('/git', {
                templateUrl: '/views/git.html',
                controller: 'FrameCtrl',
                controllerAs: 'frameCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    }
    
/**********************************************
**********************************************/

    angular
        .module('iphm.resources', [])
        .service('CoordFreqs', CoordFreqs);
    
    CoordFreqs.$inject = ['$resource'];
    
    function CoordFreqs($resource) {
        var apiSpec = '/api/v0.1/coordfreqs'
            + '&llng=:llng'
            + '&rlng=:rlng'
            + '&dlat=:dlat'
            + '&ulat=:ulat';
        this.fetchBBox = function(llng, rlng, dlat, ulat) {
            return $resource(apiSpec, {
                llng: llng,
                rlng: rlng,
                dlat: dlat,
                ulat: ulat
                })
                .query()
                .$promise;
        };
    }
    
/**********************************************
**********************************************/
    
    angular
        .module('iphm.view', [])
        .controller('FrameCtrl', FrameCtrl);
    
    FrameCtrl.$inject = [];
    
    function FrameCtrl() {
        console.log(333);
        this.tagline = 'foo!';
    }
    
/**********************************************
**********************************************/
    
    angular
        .module('iphm.map', [
            'iphm.resources',
            'leaflet-directives'
        ])
        .constant('mapCf', {
            url: 'http://api.mapbox.com/v4/{map_id}'
                + '/{z}/{x}/{y}{@2x}.{format}?access_token={apikey}',
            mapid: 'mapbox.streets',
            highDPI: false,
            format: 'png',
            apikey: 'pk.eyJ1IjoiY2FsYW1pdGl6ZXIiLCJhIjoiY2lxaTQzcm5iMDVoemZ5bnB6NXdpYnVlNyJ9.HGpHUJPiNRP75L5SaCZV5Q'
        })
    
    angular
        .module('iphm')
        .controller('MapCtrl', MapCtrl);
    
    MapCtrl.$inject = [
        '$scope', // sadly angular-leaflet-directives does not
                  // support 'controller as' syntax
        '$http'
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
}());
