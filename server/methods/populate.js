(function() {
    'use strict';
    
    var path = require('path');
    var mongoose = require('mongoose');
    var fs = require('fs');
    var fastCsv = require('fast-csv');
    var async = require('async');
    var Promise = require('bluebird');
    
    var cf = require('./cf.js');
    var CoordFreq = mongoose.model('CoordFreq');
    
    cf.names.csv = 'arch'
    
    var drop = function() {
        return CoordFreq
            .find()
            .remove()
            .exec();
    };
    var upsertCoordFreq = function(lat, long, numIps) {
        console.log('u');
        return CoordFreq
            .update({
                'coords.lat': lat,
                'coords.long': long
            }, {
                $inc: {
                    numIps: numIps
                }
            }, {
                upsert: true
            })
            .exec()
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
    
    var parseRow = function(cb, row) {
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

    var importCsv = function() {
        return new Promise(function(resolve) {
            var dest = path.join(cf.dir, cf.names.csv)
            var filestream = fs.createReadStream(dest);
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
                .on('data', function(row) {
                    async.series([
                        function(cb) {
                            filestream.pause();
                            cb(null);
                        },
                        function(cb) {
                            parseRow(cb, row);
                        },
                        function(cb) {
                            filestream.resume();
                            cb(null);
                        }
                    ]);
                })
                .on('end', function() {
                    console.log('End csv stream');
                    resolve()
                });
            filestream.pipe(csvStream);
        });
    };
    
    var setTemp = function(cf) {
        var up = {
            $set: {
                temp: temp(cf.numIps)
            }
        };
        return CoordFreq
            .update({_id: cf._id}, up)
            .exec();
    };
    
    var setTemps = function(cb) {
        return CoordFreq
            .find()
            .snapshot()
            .exec()
            .then(function(cfs) {
                return Promise.all(cfs.map(setTemp));
            })
            .catch(function(err) {
                console.log('Error setting temps:');
                console.log(err);
            });
    };
    
    var setAlpha = function(cf, maxTemp) {
        var up = {
            $set: {
                alpha: alpha(cf.temp, maxTemp)
            }
        };
        return CoordFreq
            .update({_id: cf._id}, up)
            .exec();
    };
    
    var setAlphas = function(cb) {
        var maxTemp;
        return CoordFreq
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
                    return setAlpha(cf, maxTemp);
                }));
            })
            .catch(function(err) {
                console.log('Error setting alphas:');
                console.log(err);
            });
    };
    
    var populate = function() {
        return drop()
            .then(importCsv)
            .then(setTemps)
            .then(setAlphas);
    };
    
    module.exports = populate;
}());
