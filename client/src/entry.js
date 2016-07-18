(function() {
    'use strict';
    
    var angular = require('angular');
    
    require('angular-resource');
    require('./vendor/angular-route/angular-route.js');
    require('leaflet');
    var leafletHeat = require('./vendor/leaflet-heat/leaflet-heat.js');
    require('./vendor/leaflet-heat/leaflet-heat.js');
    require('./vendor/angular-leaflet-directive/dist/angular-leaflet-directive.js');
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
                controllerAs: 'mapCtrl'
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
            'ngResource',
            'iphm.heat'
        ])
    
    angular
        .module('iphm.resources.coordfreqs')
        .factory('CoordFreqs', CoordFreqs);
    
    CoordFreqs.$inject = [
        '$resource'
    ];
    
    function CoordFreqs($resource) {
        
        var CF = this;
        
        var apiSpec = '/api/v0.1/coord-freqs'
            + '&llng=:llng'
            + '&rlng=:rlng'
            + '&dlat=:dlat'
            + '&ulat=:ulat';
        
        var status = {
            downloaded: false,
            downloading: true
        };
        
        var standingReq = null;
        
        var initiateReq = function(params) {
            standingReq = $resource(apiSpec, params, {
                'fetch': {
                    method: 'GET',
                    isArray: true,
                    cancellable: true,
                    // transformResponse: tabulate // doing this here screws
                                                   // up .$promise metadata
                }
            })
                .fetch()
            status.downloading = true;
            standingReq
                .$promise
                .then(function() {
                    status.downloading = false;
                    status.downloaded = true;
                })
                .catch(function() {
                    status.downloading = false;
                    status.downloaded = false;
                });
                    
        };
        
        var cancelReq = function() {
            if (standingReq) {
                standingReq.$cancelRequest();
                status.downloading = false;
            }
        };
        
        var fetchBBox = function(params) {
            console.log('start');
            cancelReq();
            initiateReq(params);
            return standingReq
                .$promise
                .then(tabulate);
        };
        
        var tabulate = function(cfs) {
            var x = angular.fromJson(cfs);
            return angular.fromJson(cfs).map(linearize);
        };
        
        var linearize = function(cf) {
            return [
                cf.coords.lat,
                cf.coords.long,
                cf.intensity
            ];
        };
            
        /*
        var request = (function() {
            
            var standing = null;
            
            var fetchBBox = function(llng, rlng, dlat, ulat, lim) {
                console.log('fetch');
                standing = $resource(cfCf.apiSpec, {
                    llng: llng,
                    rlng: rlng,
                    dlat: dlat,
                    ulat: ulat,
                    lim: lim
                    }, {
                        'fetch': {
                            method: 'GET',
                            isArray: true,
                            cancellable: true
                        }
                    })
                    .fetch();
            };
            
            var once = true;
            
            var linearize = function(coordFreq) {
                if (once) {
                    console.log('here', coordFreq);
                    once = false;
                }
                return [
                    coordFreq.coords.lat,
                    coordFreq.coords.long,
                    coordFreq.intensity
                ];
            };
            
            var flattenRequest = function(data) {
                return data
            };
            
            var start = function(llng, rlng, dlat, ulat, lim) {
                cancel();
                fetchBBox(llng, rlng, dlat, ulat, lim);
                standing
                    .$promise
                    .then(function(data) {
                        console.log('received', data);
                        return data;
                    })
                
            };
            
            var cancel = function() {
                if (standing) {
                    standing.$cancelRequest();
                    //this.status.cancel();
                }
            };
            
            
            return {
                start: start,
                cancel: cancel
            };
        }());
        
        // class method?
        var linearize = function(coordFreq) {
            return [
                coordFreq.coords.lat,
                coordFreq.coords.long,
                coordFreq.intensity
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
            status: status,
            standingReq: standingReq,
            fetchBBox: fetchBBox,
            cancelReq: cancelReq
        };
    }
    
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
        /*
        var layer = {
            mapboxStreets : {
                name: mbTCf.mapName,
                url: url,
                type: 'xyz'
            }
        };
        */
        
        var layer = {
            name: mbTCf.mapName,
            url: url,
            type: 'xyz'
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
    // 
    // deprecated
    
    angular
        .module('iphm.heat', [])
        .factory('Heat', Heat);
    
    Heat.$inject = [];
    
    function Heat() {
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
                //layerOptions: {
                //    radius: 100,
                //    blur: 15,
                //    gradient: {
                //        0.4: 'blue',
                //        0.65: 'lime',
                //        1: 'red'
                //    }
                //},
                visible: true
            }
        };
        
        var set = function(heat) {
            console.log('first', data);
            data.length = 0;
            Object.assign(data, heat);
            console.log('then', data);
        };
        
        var dropAll = function() {
            data.length = 0;
            data.push(seed);
        };
        
        return {
            data: data,
            layer: layer,
            set: set,
            dropAll: dropAll
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
            'leaflet-directive',
            'iphm.resources.coordfreqs',
            'iphm.resources.mapboxtiles',
            'iphm.heat'
        ])
        .constant('defCenter', {
            lat: 0,
            lng: 0,
            //lat: 30.6667,
            //lng: 104.0667,
            
            //lat: 37.774546,
            //lng: -122.433523,
            zoom: 1
        });
    
    angular
        .module('iphm.map')
        .directive('iphmMapOption', iphmMapOption);
    
    iphmMapOption.$inject = [];
    
    function iphmMapOption() {
        return {
            restrict: 'E',
            scope: {},
            /*
            bindToController: {
                value: '='
            },
            */
            controller: function() {
                var set = function() {
                    this.testvalue = 7;
                };
                this.set = set;
            },
            controllerAs: 'opCtrl',
            templateUrl: '/map/map-option.template.html'
        };
    }
    
    angular
        .module('iphm.map')
        .constant('defHMSettings', {
            radius: 9,
            blur: 7,
            minOpacity: 0.5,
            maxZoom: 5
        });
    
    angular
        .module('iphm.map')
        .controller('MapCtrl', MapCtrl);
    
    MapCtrl.$inject = [
        '$scope',
        '$http',
        'defCenter',
        'defHMSettings',
        'leafletData',
        'leafletBoundsHelpers',
        'leafletLayerHelpers',
        'leafletMapEvents',
        'CoordFreqs',
        'MapboxTiles',
        'Heat'
    ];
    
    function MapCtrl(
        $scope,
        $http,
        defCenter,
        defHMSettings,
        leafletData,
        leafletBoundsHelpers,
        leafletLayerHelpers,
        leafletMapEvents,
        CoordFreqs,
        MapboxTiles,
        Heat) {
        
        var mapCtrl = this;
        
        var center = Object.assign({}, defCenter);
        
        var bounds = leafletBoundsHelpers.createBoundsFromArray([
            [ 104.0667, -30.6667 ],
            [ 104.0667, -30.6667 ]
        ]);
        
        var hmSettings = Object.assign({}, defHMSettings);
        
        var layers = {
            baselayers: {
                mapboxStreets: MapboxTiles.layer
            },
            overlays: {
                heat: {
                    name: 'Heatmap',
                    type: 'heat',
                    data: [],
                    layerOptions: hmSettings,
                    visible: true
                }
            }
        };
        
        angular.extend(mapCtrl, {
            center: center,
            bounds: bounds,
            layers: layers
        });
        
        /*
        var heatmapLayer = {
            heat: {
                name: 'Heatmap',
                type: 'heat',
                data: [],
                layerOptions: mapCtrl.hmSettings,
                visible: true
            }
        };
        
        
        var heatmapLayer = {
            name: 'Heatmap',
            type: 'heat',
            data: [],
            layerOptions: mapCtrl.hmSettings,
            visible: true
        };
        */
        /*
            Object.assign(mapCtrl.data, data);
        */
        mapCtrl.setData = function(data) {
            console.log('type', typeof data);
            var n = 0;
            for (var i in data) {
                if ((typeof data[i][0] !== 'number')
                    || (typeof data[i][1] !== 'number')
                    || (typeof data[i][2] !== 'number')) {
                        throw new Error(i, data[i]);
                }
            }
            /*
            for (var i in data) {
                if (n % 1000 === 0) console.log(n);
                var cf = data[i];
                if (typeof cf[0] !== 'number') console.log('TE0', cf);
                if (typeof cf[1] !== 'number') console.log('TE1', cf);
                if (typeof cf[2] !== 'number') console.log('TE2', cf);
                if (Math.abs(cf[0]) > 90) console.log('RE0', cf);
                if (Math.abs(cf[0]) > 180) console.log('RE1', cf);
                if ((cf[2] < 0) || (cf[2] > 1)) console.log('RE2', cf);
            }
            */
            leafletData
                .getLayers()
                .then(function(layers) {
                    var heat = layers
                        .overlays
                        .heat;
                    heat.setLatLngs(data);
                });
        };
            /*
            mapCtrl
                .layers
                .overlays
                .heat
                .data = [
                    [90, 45, 1]
                ];
            */
            /*
            leafletData
                .getLayers()
                .then(function(layers) {
                    var heat = layers
                        .overlays
                        .heat;
                    heat.setLatLngs(data);
                })
                .then(function() {
                    mapCtrl
                        .layers
                        .overlays
                        .heat
                        .doRefresh = true;
                
                });
            */
        
        mapCtrl.request = function(params) {
            CoordFreqs
                .fetchBBox(params)
                .then(function(data) {
                    console.log(typeof data, data);
                    console.log(typeof data[0], data[0]);
                    console.log(typeof data[0][0], data[0][0]);
                    mapCtrl.setData(data);
                })
                            
                        
                        /*
                        .update(); // angular-leaflet-directive automatically
                                   // updates heatmap layers with type
                                   // 'heatmap', but does not allow layers
                                   // of that type; only 'heat'. whoops.
                        */
                .then(function() {
                    console.log('data:', mapCtrl
                        .layers
                        .overlays
                        .heat
                        .data);
                });
        };
        
        console.log('standing', CoordFreqs.standingReq);
        
        mapCtrl.getCoords = function() {
            return {
                llng: mapCtrl.bounds.southWest.lng,
                rlng: mapCtrl.bounds.northEast.lng,
                dlat: mapCtrl.bounds.southWest.lat,
                ulat: mapCtrl.bounds.northEast.lat
            }
        };
        
        $scope.$on('leafletDirectiveMap.moveend', function() {
            if (mapCtrl.dynamic) {
                mapCtrl.request(mapCtrl.getCoords());
            }
        });
        
        mapCtrl.status = CoordFreqs.status;
        
        mapCtrl.dynamic = 0;
        
        mapCtrl.globe = {
            llng: -180,
            rlng: 180,
            dlat: -90,
            ulat: 90,
            lim: 5000
        };
        
        mapCtrl.toggleDynamic = function() {
            mapCtrl.dynamic ^= 1;
            CoordFreqs.cancelReq();
            var coords;
            if (mapCtrl.dynamic) {
                mapCtrl.setData([]);
                mapCtrl.status.downloaded = false;
                coords = mapCtrl.getCoords();
            } else {
                coords = mapCtrl.globe;
            }
            mapCtrl.request(coords);
        };
        
        if (!mapCtrl.dynamic) {
            mapCtrl.request(mapCtrl.globe);
        }
        
        /*
        CoordFreqs
            .fetchBBox(-179, 179, -89, 89, 5000)
            .then(function(res) {
                console.log('after');
                console.log('res', res);
            })
            .then(mapCtrl.setData);
        */
    }
}());
