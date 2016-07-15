(function() {
    'use strict';
    
    var angular = require('angular');
    
    require('angular-resource');
    require('./vendor/angular-route/angular-route.js');
    require('leaflet');
    var leafletHeat = require('./vendor/leaflet-heat/leaflet-heat.js');
    require('./vendor/leaflet-heat/leaflet-heat.js');
    require('angular-leaflet-directive');
    var Promise = require('bluebird');
    
    console.log('past req');
    
    angular
        .module('iphm', [
            'ngRoute',
            'ngResource',
            'iphm.view',
            'iphm.resources.coordfreqs',
            'iphm.resources.mapboxtiles',
            'iphm.map',
            'iphm.heat'
            // 'iphm.cf',
        ]);
    
    angular
        .module('iphm')
        .config(routeConfig);
        
    routeConfig.$inject = [
        '$routeProvider',
        '$locationProvider'
    ];
    
    function routeConfig($routeProvider, $locationProvider) {
        console.log('configged');
        $routeProvider
            .when('/map', {
                templateUrl: '/views/map.html',
                controller: 'MapCtrl',
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
                templateIrl: '/views/map.html',
                redirectTo: '/map'
            });
        $locationProvider.html5Mode(true);
    }
    
/**********************************************
**********************************************/

    angular
        .module('iphm.resources.coordfreqs', [
            'ngResource'
        ])
        .constant('cfCf', {
            apiSpec: '/api/v0.1/coord-freqs'
                + '&llng=:llng'
                + '&rlng=:rlng'
                + '&dlat=:dlat'
                + '&ulat=:ulat'
        });
    
    angular
        .module('iphm.resources.coordfreqs')
        .factory('CoordFreqs', CoordFreqs);
    
    CoordFreqs.$inject = [
        '$resource',
        'cfCf'
    ];
    
    function CoordFreqs($resource, cfCf) {
        
        var fetchBBox = function(llng, rlng, dlat, ulat, lim) {
            return $resource(cfCf.apiSpec, {
                llng: llng,
                rlng: rlng,
                dlat: dlat,
                ulat: ulat,
                lim: lim
                })
                .query()
                .$promise
                .then(tabulate)
                //.then(validate); // testing purposes
        };
        
        // class method?
        var linearize = function(coordFreq) {
            return [
                coordFreq.coords.lat,
                coordFreq.coords.long,
                1 - coordFreq.alpha // Leaflet wants intensity
            ];
        };
        
        var tabulate = function(coordFreqs) {
            return coordFreqs.map(linearize);
        };
        
        /*
        var validate = function(coordFreqs) {
            var anyLat = true;
            var anyLng = true
            var anyInt = true;
            for (var i in coordFreqs) {
                var cf = coordFreqs[i];
                if (Math.abs(cf[0]) > 90) {
                    anyLat = false;
                    console.log(cf);
                }
                if (Math.abs(cf[1]) > 180) {
                    anyLng = false;
                    console.log(cf);
                }
                if (cf[2] > 1 || cf[2] < 0) {
                    anyInt = false;
                    console.log(cf);
                }
                if ((typeof cf[0] !== 'number')) throw new Error('0 '+String(cf));
                if ((typeof cf[1] !== 'number')) throw new Error('1 '+String(cf));
                if ((typeof cf[2] !== 'number')) throw new Error('2 '+String(cf));
                console.log(anyLat, anyLng, anyInt);
            }
        };
        */
        
        return {
            fetchBBox: fetchBBox,
            linearize: linearize,
            tabulate: tabulate
        };
    }
        /*
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
        */
    
    angular
        .module('iphm.resources.mapboxtiles', [])
        .constant('mbTCf', {
            apiSpec: 'http://api.mapbox.com/v4/:mapId/:z/:x/:y:highDPI.:format?access_token=:apikey',
            mapName: 'Mapbox Streets',
            mapId: 'mapbox.streets',
            highDPI: false ? '@2x' : '',
            format:'png',
            // inject later:
            apikey: 'pk.eyJ1IjoiY2FsYW1pdGl6ZXIiLCJhIjoiY2lxaTQzcm5iMDVoemZ5bnB6NXdpYnVlNyJ9.HGpHUJPiNRP75L5SaCZV5Q'
        });
    
    angular
        .module('iphm.resources.mapboxtiles')
        .factory('MapboxTiles', MapboxTiles);
    
    MapboxTiles.$inject = [
        'mbTCf'
    ];
    
    function MapboxTiles(mbTCf) {
        var url = 'https://api.mapbox.com/v4/'
            + mbTCf.mapId + '/{z}/{x}/{y}'
            + mbTCf.highDPI + '.' + mbTCf.format
            + '?access_token=' + mbTCf.apikey;
        
        var layer = {
            mapboxStreets : {
                name: mbTCf.mapName,
                url: url,
                type: 'xyz'
            }
        };
        
        return {
            layer: layer
        };
    }
    
/**********************************************
**********************************************/
    
    // an abstract data type to decouple the
    // map layer from the CoordFreqs i/o stream,
    // so we can add and remove points
    // after we've set the layer
    
    angular
        .module('iphm.heat', [])
        .factory('Heat', Heat);
    
    Heat.$inject = [];
    
    function Heat() {
        // an invisible point to populate the layer
        var seed = [0, 0, 0];
        // we want `data` to be stored so that
        // the methods below continue affecting
        // `Heat.layer`, which is a (nested)
        // member of the 2-way-bound `leaflet`
        // directive's `$scope.layer`
        var data = [seed];
        var layer = {
            heat: {
                name: 'Heatmap',
                type: 'heat',
                data: data,
                layerOptions: {
                    radius: 100,
                    blur: 15,
                    gradient: {
                        0.4: 'blue',
                        0.65: 'lime',
                        1: 'red'
                    }
                },
                visible: true
            }
        };
        
        var set = function(heat) {
            data = heat;
        };
        
        var addOne = function(heat) {
            data.push(heat);
        };
        
        // ^ quite unnecessary, because I haven't
        //   set up mongoose to do streaming yet
        
        var dropAll = function() {
            data = [seed];
        };
        
        return {
            layer: layer,
            set: set,
            addOne: addOne,
            dropAll: dropAll
        };
        
        // I love the revealing module pattern...
        
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
            'leaflet-directive',
            'iphm.resources.coordfreqs',
            'iphm.resources.mapboxtiles',
            'iphm.heat'
        ])
        .constant('defCenter', {
            lat: 30.6667,
            lng: 104.0667,
            
            //lat: 37.774546,
            //lng: -122.433523,
            zoom: 12
        });
    
    angular
        .module('iphm.map')
        .controller('MapCtrl', MapCtrl);
    
    MapCtrl.$inject = [
        '$scope', // sadly angular-leaflet-directives does not
                  // support 'controller as' syntax afaict
        '$http',
        'defCenter',
        'CoordFreqs',
        'MapboxTiles',
        'Heat'
    ];
    
    function MapCtrl($scope, $http, defCenter, CoordFreqs, MapboxTiles, Heat) {
        
        /*
        var bounds = leafletBoundsHelpers.createBoundsFromArray([
                [ 104.0667, -30.6667 ],
                [ 104.0667, -30.6667 ]
            ]);
        */
        
        var layers = {
            baselayers: MapboxTiles.layer,
            overlays: Heat.layer
        };
        
        angular.extend($scope, {
            //bounds: bounds,
            center: defCenter,
            layers: layers
        });
        
        
        
        /*
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
        */
        
        // // will populate the layer as it arrives thanks to `$resource`
        // Heat.set(CoordFreqs.fetchBBox(-179, 179, -89, 89));
        
        /*
        CoordFreqs
            .fetchBBox(-179, 179, -89, 89)
            .$promise
            .then(function(coordFreqs) {
                Heat.set(CoordFreqs.tabulate(coordFreqs));
            })
            .catch(function(reason) {
                console.log(reason);
            });
        */
        
        /*
        var llng = -122.608451843262;
        var rlng = -122.258262634277;
        var dlat = 37.7093561353369;
        var ulat = 37.8396145727522;
        */
        
        /*
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
                            radius: 20,
                            blur: 10
                        },
                        visible: true
                    }
                };
            });
        */
        
        /*
        var layerOptions = {
            radius: 2,
            maxOpacity: .8,
            scaleRadius: true,
            useLocalExtrema: true,
            
        };
        */
        
        var layerOptions = {
            radius: 10,
            maxZoom: 4,
            scaleRadius: true,
            blur: 3,
            
        };
        
        
        CoordFreqs
            .fetchBBox(-179, 179, -89, 89, 5000)
            .then(function(data) {
                console.log('test');
                console.log(data);
                $scope.layers.overlays = {
                    heat: {
                        name: 'Heatmap',
                        type: 'heat',
                        data: data,
                        layerOptions: layerOptions,
                        visible: true
                    }
                };
            });
        
        
        
        /*
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
        */
    }
}());
