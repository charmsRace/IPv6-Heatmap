    angular
        .module('iphm.resources.coordfreqs', [
            'ngResource',
            'iphm.heat'
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
        'cfCf',
        'Heat'
    ];
    
    function CoordFreqs($resource, cfCf, Heat) {
        
        var status = (function() {
            var downloaded = false;
            var downloading = false;
            var start = function() {
                downloading = true;
            };
            var finish = function() {
                downloaded = true;
                downloading = false;
            };
            var cancel = function() {
                downloading = false;
            };
            var isDownloading = function() {
                return downloading;
            };
            var isDownloaded = function() {
                return downloaded;
            };
            return {
                start: start,
                finish: finish,
                cancel: cancel,
                downloaded: downloaded,
                downloading: downloading
            };
        }());
        
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
            request: request,
            linearize: linearize,
            tabulate: tabulate
        };
    }
