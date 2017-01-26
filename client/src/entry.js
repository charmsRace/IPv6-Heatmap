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
        
        var BBox = $resource(apiSpec, {
            inten: 1
        }, {
            'fetch': {
                method: 'GET',
                isArray: true,
                cancellable: true
            }
        }, {
            cancellable: true
        });
        
        var initiateReq = function(params) {
            standingReq = BBox.fetch(params);
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
            if (standingReq && standingReq.$cancelRequest) {
                // if .$cancelRequest isn't there,
                // the request has already been completed
                // and the data has been processed
                standingReq.$cancelRequest();
                status.downloading = false;
            }
        };
        
        var fetchBBox = function(params) {
            cancelReq();
            initiateReq(params);
            return standingReq
                .$promise;
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
            format: 'png',
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
            name: mbTCf.mapName,
            url: url,
            type: 'xyz',
            layerOptions: {
                attribution: '© <a href=\'https://www.mapbox.com/map-feedback/\'>Mapbox</a>'
                + ' | '
                + '© <a href=\'http://www.openstreetmap.org/copyright\'>OpenStreetMap</a>'
            }
        };
        
        return {
            layer: layer
        };
    }
    
/**********************************************
**********************************************/
    
    angular
        .module('iphm.view', [])
        .controller('FrameCtrl', FrameCtrl);
    
    FrameCtrl.$inject = [];
    
    function FrameCtrl() {
    }
    
/**********************************************
**********************************************/
    
    angular
        .module('iphm.map', [
            'leaflet-directive',
            'iphm.resources.coordfreqs',
            'iphm.resources.mapboxtiles'
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
            radius: 6,
            blur: 4,
            minOpacity: 0.2,
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
        'MapboxTiles'
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
        MapboxTiles) {
        
        var mapCtrl = this;
        
        var defaults = {
            worldCopyJump: true,
            minZoom: 3
        };
        
        var center = Object.assign({}, defCenter);
        
        var bounds = leafletBoundsHelpers.createBoundsFromArray([
            [ 104.0667, -30.6667 ],
            [ 104.0667, -30.6667 ]
        ]);
        
        
        // wrangle options into a structure the map-option
        // directive can get the relevant info from, so
        // each component only has access to one setting
        // and not the whole configuration hash
        mapCtrl.hmSettings = {};
        Object
            .keys(defHMSettings)
            .map(function(setting) {
                mapCtrl.hmSettings[setting] = {
                    value: defHMSettings[setting],
                    def: defHMSettings[setting]
                };
            });
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
            defaults: defaults,
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
            /*
            var n = 0;
            for (var i in data) {
                if (n % 1000 === 0) console.log(n);
                var cf = data[i];
                if (typeof cf[0] !== 'number') console.log('TE0', cf);
                if (typeof cf[1] !== 'number') console.log('TE1', cf);
                if (typeof cf[2] !== 'number') console.log('TE2', cf);
                if (Math.abs(cf[0]) > 90) console.log('RE0', cf);
                if ((cf[2] < 0) || (cf[2] > 1)) console.log('RE2', cf);
            }
            */
            
            mapCtrl
                .getBounds()
                .then(function(bounds) {
                    if (mapCtrl.options.wrap) {
                        var llng = bounds.llng;
                        var rlng = bounds.rlng;
                        var length = data.length;
                        if (llng < -180) {
                            for (var i = 0; i < length; i++) {
                                var cf = data[i];
                                var long = cf[1];
                                if (llng + 360 <= long) {
                                    data.push([cf[0], long - 360, cf[2]]);
                                }
                            }
                        }
                        if (180 < rlng) { // these loops can't ever both activate
                                          // because of the minZoom of the map
                                          // (max longitudinal width ~= 200)
                            for (var i = 0; i < length; i++) {
                                var cf = data[i];
                                var long = cf[1];
                                if (long <= rlng - 360) {
                                    data.push([cf[0], long + 360, cf[2]]);
                                }
                            }
                        }
                    }
                })
                .then(leafletData.getLayers)
                .then(function(layers) {
                    layers
                        .overlays
                        .heat
                        .setLatLngs(data);
                });
        };
        
        mapCtrl.request = function(paramProm) {
            CoordFreqs.cancelReq();
            //mapCtrl.setData([]); // this is really just for visual confirmation
            mapCtrl.status.downloaded = false;
            paramProm
                .then(CoordFreqs.fetchBBox)
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
                });
        };
        
        mapCtrl.getBounds = function() {
            // returns [a promise for] the bounds that the
            // next api response should cover. longitudes are
            // not always less than 180 in magnitude because
            // of wrapping. if dynamic is off, we're proactive
            // and snag an extra bit of padding
            return (!mapCtrl.options.dynamic)
                ? Promise.resolve({
                    llng: -280,
                    rlng: 280,
                    dlat: -90,
                    ulat: 90
                })
                : leafletData
                    .getMap()
                    .then(function(map) {
                        var bounds = map.getBounds();
                        var coords =  {
                            llng: bounds.getWest(),
                            rlng: bounds.getEast(),
                            dlat: bounds.getSouth(),
                            ulat: bounds.getNorth()
                        };
                        return coords;
                    });
        };
        
        mapCtrl.wrapLong = function(long) {
            // forces a longitude into [-180, +180)
            // javascript's % is stupid with negative numbers
            // or else ((long + 180) % 360) - 180 would suffice
            return ((((long + 180) % 360) + 360) % 360) - 180;
        };
        
        mapCtrl.getParams = function() {
            // retrieves [a promise for] the params the api should
            // be fed to update the map based on current settings
            return (!mapCtrl.options.dynamic)
                ? Promise.resolve(mapCtrl.globe)
                : mapCtrl
                    .getBounds()
                    .then(function(bounds) {
                        bounds.llng = mapCtrl.wrapLong(bounds.llng);
                        bounds.rlng = mapCtrl.wrapLong(bounds.rlng);
                        return bounds;
                    });
        };
        
        mapCtrl.redraw = function() {
            if (mapCtrl.options.dynamic) {
                CoordFreqs.cancelReq();
                mapCtrl.request(mapCtrl.getParams());
            }
        };
        
        mapCtrl.init = function() {
            mapCtrl.request(mapCtrl.getParams());
            leafletData
                .getMap()
                .then(function(map) {
                    map.setMaxBounds([
                        [-85, -Infinity],
                        [85, Infinity]
                    ]);
                });
        };
        
        $scope.$on('leafletDirectiveMap.moveend', mapCtrl.redraw);
        
        $scope.$on('leafletDirectiveMap.load', mapCtrl.init);
        
        mapCtrl.status = CoordFreqs.status;
        
        mapCtrl.options = {
            dynamic: 1,
            wrap: 1
        };
        
        mapCtrl.globe = {
            llng: -180,
            rlng: 180,
            dlat: -90,
            ulat: 90,
        };
        
        mapCtrl.toggleDynamic = function() {
            mapCtrl.options.dynamic ^= 1;
            mapCtrl.request(mapCtrl.getParams());
        };
        
        mapCtrl.toggleWrap = function() {
            mapCtrl.options.wrap ^= 1;
            mapCtrl.request(mapCtrl.getParams());
        };
    }
}());
