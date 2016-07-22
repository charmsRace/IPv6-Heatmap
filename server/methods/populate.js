(function() {
    'use strict';
    
    var path = require('path');
    var mongoose = require('mongoose');
    var Promise = require('bluebird');
    mongoose.Promise = Promise;
    var fs = require('fs');
    var fastCsv = require('fast-csv');
    var async = require('async');
    var through = require('through');
    var arrayEqual = require('array-equal'); // Oh, javascript...
    
    var cf = require('./cf.js');
    var CoordFreq = mongoose.model('CoordFreq');
    
    cf.names.csv = process.env.CSV_TO_READ || cf.names.csv;
    
    var drop = function() {
        return CoordFreq
            .find()
            .remove()
            .exec();
    };
    
    // not a true dao since it has nothing to do with
    // the actual stored object, but it keeps track
    // of maxTemp at least
    var dao = (function() {
        
        var maxTemp = 0;
        
        var getNumIps = function(network) {
            var mask = Number(/\/(\d+)$/.exec(network)[1]);
            var blockSize = Math.pow(2, Math.pow(2, 7) - mask);
            return blockSize;
        };
        
        var getTemp = function(numIps) {
            var temp = Math.log(numIps + 1);
            if (temp > maxTemp) {
                maxTemp = temp;
            }
            return +temp.toFixed(4);
        };
        
        var getMaxTemp = function() {
            return maxTemp;
        };
        
        return {
            getNumIps: getNumIps,
            getTemp: getTemp,
            getMaxTemp: getMaxTemp
        };
    }());
    
    // let's just let JS do what it does best
    // and damn can it lookup object keys
    var total = 0;
    var uniques = 0;
    var tab = {}; // after the dry run,
                  // tab[String(lat) + '&&' + String(long)] = numIps
    var hashmod = 10000;
    // move this into closure
    var hash = function(row) {
        //console.log(row);
        total++;
        if (row.lat === 'latitude') {
            return;
        }
        if (total % hashmod === 0) console.log('t', total, 'u', uniques)
        var key = [row.lat, row.long]
            .map(Number) // the keys' uniquness will be evaluated
                         // as a number eventually, so cast it 
                         // there and back up front
            .map(String)
            .join('&&');
        var numIps = dao.getNumIps(row.network);
        if (!tab.hasOwnProperty(key)) {
            tab[key] = {};
            tab[key].lat = Number(row.lat);
            tab[key].long = Number(row.long);
            tab[key].numIps = numIps
            uniques++;
        } else {
            tab[key].numIps += numIps;
        }
    };
    
    var format = function() {
        return Object.keys(tab)
            .map(function setTemp(key) {
                tab[key].temp = dao.getTemp(tab[key].numIps);
                return key;
            })
            /*
            .map(function setAlpha(key) {
                tab[key].alpha = dao.getAlpha(tab[key].temp);
                tab[key].intensity = dao.getIntensity(tab[key].numIps);
                return key;
            })
            */
            .map(function convertToDoc(key) {
                var maxTemp = dao.getMaxTemp();
                return {
                    coords: {
                        lat: tab[key].lat,
                        long: tab[key].long
                    },
                    numIps: tab[key].numIps,
                    intensity: tab[key].temp / maxTemp
                };
            });
            /*
            .map(function concertToDoc(key) {
                var doc = {
                    coords: {
                        lat: tab[key].lat,
                        long: tab[key].long
                    },
                    numIps: tab[key].numIps,
                    temp: tab[key].temp,
                    alpha: tab[key].alpha,
                    intensity: tab[key].intensity
                };
                //console.log(doc);
                return doc;
            });
            */
    };
    
    var upload = function(docs) {
        console.log('Saving ' + docs.length);
        return CoordFreq.insertMany(docs)
            .then(function() {
                console.log('Done.');
            });
    };
    
    var importCsv = function(dryRun) {
        return new Promise(function(resolve) {
            var dest = path.join(cf.dir, cf.names.csv);
            var filestream = fs
                .createReadStream(dest, {
                });
            var csvStream = fastCsv.parse({
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
            });
            filestream
                .pipe(csvStream);
            
            csvStream
                .on('data', hash)
                .on('end', function() {
                    console.log('End csv stream');
                    resolve();
                });
        });
    };
    
    var populate = function() {
        return drop()
            .then(importCsv)
            .then(format)
            .then(upload)
            .then(function() {
                console.log('done');
            });
    };
    
    module.exports = populate;
}());
