(function() {
    'use strict';
    
    var angular = require('angular');
    
    require('angular-resource');
    require('./vendor/angular-route/angular-route.js');
    require('leaflet');
    require('./vendor/leaflet-heat/leaflet-heat.js');
    require('./vendor/leaflet-heat/leaflet-heat.js');
    require('./vendor/angular-leaflet-directive/dist/angular-leaflet-directive.js');
    var Promise = require('bluebird');
    
    console.log('past req');
    
    /*
     * Note: I would normally move all of these angular
     * components to separate files, but I feel like
     * that would just be frustrating since this is
     * for review.
     * 
     */
    
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
            /*
            .when('/git', {
                templateUrl: '/views/git.html',
                controller: 'FrameCtrl',
                controllerAs: 'frameCtrl'
            })
            */
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
            params['inten'] = 1;
            standingReq = $resource(apiSpec, params, {
                'fetch': {
                    method: 'GET',
                    isArray: true,
                    cancellable: true
                }
            })
                .fetch();
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
                //standingReq.$cancelRequest(); // slightly broken
                status.downloading = false;
            }
        };
        
        var fetchBBox = function(params) {
            cancelReq();
            initiateReq(params);
            return standingReq
                .$promise
                .then(function(data) {
                    return data;
                });
        };
        
        /*
        var validate = function(coordFreqs) {
            var anyLat = false;
            var anyLng = false
            var anyInt = false;
            for (var i in coordFreqs) {
                var cf = coordFreqs[i];
                if (Math.abs(cf[0]) > 90) {
                    anyLat = true;
                    console.log(cf);
                }
                if (Math.abs(cf[1]) > 180) {
                    anyLng = true;
                    console.log(cf);
                }
                if (cf[2] > 1 || cf[2] < 0) {
                    anyInt = true;
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
            lat: 35.7596,
            lng: -79.0193,
            zoom: 4
        });
    
    angular
        .module('iphm.map')
        .directive('iphmMapOption', iphmMapOption);
    
    iphmMapOption.$inject = [];
    
    function iphmMapOption() {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                setting: '='
            },
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
            radius: 7,
            blur: 6,
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
        
        mapCtrl.hmSettings = {};
        
        Object
            .keys(defHMSettings)
            .map(function(setting) {
                mapCtrl.hmSettings[setting] = {
                    value: defHMSettings[setting],
                    def: defHMSettings[setting]
                };
            });
        
        console.log(mapCtrl.hmSettings);
        
        angular.merge(mapCtrl.hmSettings, {
            radius: {
                name: 'Radius',
            },
            blur: {
                name: 'Blur',
            },
            minOpacity: {
                name: 'Min. Opacity',
            },
            maxZoom: {
                name: 'Max. Zoom',
            }
        });
        
        console.log(mapCtrl.hmSettings);
        
        var layers = {
            baselayers: {
                mapboxStreets: MapboxTiles.layer
            },
            overlays: {
                heat: {
                    name: 'Heatmap',
                    type: 'heat',
                    data: [],
                    layerOptions: defHMSettings,
                    visible: true
                }
            }
        };
        
        angular.extend(mapCtrl, {
            center: center,
            bounds: bounds,
            layers: layers
        });
        
        mapCtrl.setOptions = function() {
            var newOptions = {};
            
            Object
                .keys(mapCtrl.hmSettings)
                .map(function(setting) {
                    newOptions[setting] = mapCtrl.hmSettings[setting].value;
                });
            
            leafletData
                .getLayers()
                .then(function(layers) {
                    layers
                        .overlays
                        .heat
                        .setOptions(newOptions);
                });
        };
        
        mapCtrl.setData = function(data) {
            console.log('type', typeof data);
            var n = 0;
            for (var i in data) {
                if ((typeof data[i][0] !== 'number')
                    || (typeof data[i][1] !== 'number')
                    || (typeof data[i][2] !== 'number')) {
                        console.log(i, data[i]);
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
                    delete data.$promise;
                    delete data.$resolved;
                    delete data.$cancelRequest;
                    data = data.map(function(obj) {
                        return Object
                            .keys(obj)
                            .map(function(key) {
                                return obj[key];
                            });
                        });
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
    }
}());
