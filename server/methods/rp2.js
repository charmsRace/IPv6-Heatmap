var path = require('path');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var fs = require('fs');
var lineInputStream = require('line-input-stream');
var fastCsv = require('fast-csv');
var async = require('async');
var dbcf = require('./dbcf.js');

var l = console.log;

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {    
    var coordFreqSchema = new mongoose.Schema({
        coords: {
            type: {
                lat: {
                    type: Number
                },
                long: {
                    type: Number
                }
            }
        },
        numIps: {
            type: Number,
            default: 0
        },
        temp: {
            type: Number,
            default: 0
        },
        alpha: {
            type: Number,
            default: 0
        }
    });
    
    var CoordFreq = mongoose.model('CoordFreq', coordFreqSchema);
    
    var dropCoordFreq = function() {
        CoordFreq.remove({}, function(err) {
            if (err) {
                console.log('Error deleting');
                console.log(err);
            }
        });
    };
    
    var dropCF = function(cb) {
        CoordFreq
            .find()
            .remove()
            .exec(function(err, res) {
                cb(null);
            });
    };
    var upsertCoordFreq = function(lat, long, numIps) {
        //console.log('' + lat + ' ' + long + ' ' + numIps);
        
        return CoordFreq
            .update(
                {
                    'coords.lat': lat,
                    'coords.long': long
                },
                {
                    $inc: {
                        numIps: numIps
                    }
                },
                {
                    upsert: true
                }
            )
            .exec();
    };
//    dropCoordFreq();
    
    
    
    var seriesWrap = function(fns) {
        async.series(fns.map(function(fn) {
            return function(cb) {
                fn();
                cb(null);
            };
        }));
    };
    
    var cbWrap = function(fn) {
        return function(cb) {
            fn();
            cb(null);
        };
    };

    var showCF = function(cb) {
        console.log('all cf: ');
        CoordFreq.find(function(err, coordFreqs) {
            console.log(coordFreqs);
        });
        cb(null);
    };
    
    var blockSize = function(network) {
        try {
            var mask = /\/(\d+)$/.exec(network)[1];
            //console.log(mask);
        } catch(err) {
            console.log('Error finding mask of network ' + network);
            throw err;
        }
        return 128 + mask;
        return Math.pow(2, Math.pow(2, 7) - mask);
    };
    
    var temp = function(numIps) {
        return Math.log(Math.log(numIps + 1) + 1);
    };
    
    var alpha = function(temp, maxTemp) {
        return ((maxTemp - temp) / maxTemp);
    };
    
    var csvPath = dbcf.dir + '/' + dbcf.db.dirname + '/' + dbcf.db.csvname;
    var csvPath = './testip.csv';
    
    var parseRow = function(cb, row) {
        console.log(row);
        if (row.network === 'network') {
            cb(null);
            return;
        }
        var lat = Number(row.lat);
        var long = Number(row.long);
        var numIps = blockSize(row.network);
        upsertCoordFreq(lat, long, numIps)
            .then(function(cf) {
                cb(null);
            })
            .catch(function(err) {
                console.log('Error parsing row:');
                console.log(err);
            })
    };
    
    var importCsv = function(cb) {
        var stream = fs.createReadStream(csvPath);
        var csvStream = fastCsv
            .parse({
                headers: [
                    'network', // network
                    ,          // geoname_id
                    ,          // registered_country_geoname_id
                    ,          // represented_country_geoname_id
                    ,          // is_anonymous_proxy
                    ,          // is_satellite_provider
                    ,          // postal_code
                    'lat',     // latitude
                    'long',    // longitude
                    ,          // accuracy_radius
                ]
            })
            .on('data', function (row) {
                async.series([
                    function(cb) {
                        stream.pause();
                        cb(null);
                    },
                    function(cb) {
                        parseRow(cb, row);
                    },
                    function(cb) {
                        stream.resume();
                        cb(null);
                    }
                ])
            })
            .on('end', function() {
                console.log('End csv stream');
                cb(null);
            });
        l('before');
        l(stream.pipe(csvStream));
        l('after');
    };
    
    var showCF = function(cb) {
        CoordFreq
            .find()
            .snapshot()
            .exec()
            .then(function(res) {
                console.log(res);
                cb(null);
            })
            .catch(function(err) {
                console.log('Error showing all CFs:');
                console.log(err);
            });
    };
    
    var setTempAsync = function(cf) {
        return CoordFreq
            .update(
                {
                    _id: cf._id
                },
                {
                    $set: {
                        temp: temp(cf.numIps)
                    }
                }
            )
            .exec();
    };
    
    var setTemps = function(cb) {
        CoordFreq
            .find()
            .snapshot()
            .exec()
            .then(function(cfs) {
                l(1);
                return Promise.all(cfs.map(setTempAsync));
            })
            .then(function() {
                l(2);
                cb(null);
            })
            .catch(function(err) {
                console.log('Error setting temps:');
                console.log(err);
            });
    };
    
    var setAlphas = function(cb) {
        var maxTemp;
        CoordFreq
            .findOne()
            .sort('-temp')
            .exec()
            .then(function(cf) {
                maxTemp = cf.temp;
                return;
            })
            .then(function() {
                return CoordFreq
                    .find()
                    .snapshot()
                    .exec();
            })
            .then(function(cfs) {
                return Promise.all(cfs.map(function(cf) {
                    return CoordFreq
                        .update(
                            {
                                _id: cf
                            },
                            {
                                $set: {
                                    alpha: alpha(cf.temp, maxTemp)
                                }
                            }
                        )
                        .exec();
                }));
            })
            .then(function() {
                cb(null);
            })
            .catch(function(err) {
                console.log('Error setting alphas:');
                console.log(err);
            });
    };
    
    var testfun = function(cb) {
        console.log('test');
        cb(null);
    };
    
    var wait = function(cb) {
        setTimeout(function() {
            cb(null);
        }, 100);
    };
    
    /*
    async.series([
        dropCF,
        showCF,
        testfun,
        importCsv,
        testfun,
        function(cb) {
            console.log('end async');
            cb(null);
        },
    ]);
    */
    
    async.series([
        dropCF,
        wait,
        showCF,
        wait,
        testfun,
        wait,
        importCsv,
        wait,
        showCF,
        testfun,
        setTemps,
        testfun,
        setAlphas,
        showCF
    ]);
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

});
