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
    
    var logThrough = (function() {
        return through(function(data) {
            console.log(data);
            this.queue(data);
        })
    }());
    
    var cf = require('./cf.js');
    var CoordFreq = mongoose.model('CoordFreq');
    
    cf.names.csv = process.env.CSV_TO_READ || cf.names.csv;
    
    var drop = function() {
        return CoordFreq
            .find()
            .remove()
            .exec();
    };
    
    var processed = 0;

    /* This is the memory leak
    var upsertCoordFreq = function(lat, long, numIps) {
        CoordFreq
            .update({
                'coords.lat': lat,
                'coords.long': long
            }, {
                $inc: {
                    numIps: numIps
                }
            }, {
                upsert: true
            }, function(){});
    };
    */

    var upsertCoordFreq = function(lat, long, numIps) {
        return CoordFreq.findOneAndUpdate({
            'coords.lat': lat,
            'coords.long': long
        }, {
            $inc: {
                numIps: numIps
            }
        }, {
            upsert: true
        }).exec();
    };
    
    var getTemp = function(numIps) {
        //return numIps;
        return Math.log(Math.log(numIps + 1) + 1);
    };
    
    var getAlpha = function(temp, maxTemp) {
        return ((maxTemp - temp) / maxTemp);
    };
    
    var counter = 0;
    var n = 0;
    var nModified = 0;
    var current = 0;
    var queries = 0;
    
    var times = [0 + Date.now(),,];
    
    var maxConcurrency = Infinity;
    
    // closure for memory leak
    
    var lastrow = [0,0,0];
    
    /*
     *  I should probably move this to 
     *  the CoordFreq controller as a static
     *  
     *  singleton closure
     *  handles all delays and control flow for adding to mongo
     *  basically a big wrapper for
     *    `mongoose('Model').update(...{upsert: true}).exec()`
     *  but doesn't send all the queries at once,
     *  because mongoose db queries are *slooow*
     *  and totally memory-leak no matter what they say
     *  
     *  I could also probably make this a 
     *  stream, but that does not sound fun
     *  
     */
     
    
     
    var coordFreqBuffer = (function() {
        
        var cf = {
            maxAtOnce: Infinity,
            waitTime: 10000,
            vb: true,
            logmod: 100000,
            savemod: 10000,
            hist: 30
        };
        
        // we'll keep track of the last few so we can
        // upsert on the location, since the data
        // appear to be sorted. note these won't be in
        // order, so we'll have to sum up at the end anyway
        var prev = Array(cf.hist).fill(Array(4).fill(null));
        var counter = 0;
        var processed = 0;
        
        var contents = [
            [ , , ] // this row will be deleted
        ];
        
        // ended up not being required
        var router = (function() {
            var buffer = [
                [ [], [] ],
                [ [], [] ]
            ];
            
            var r = [ 0, 0 ];
            
            var swapDest = function() {
                var x = r[!(r[0] === r[1])]; // r[0] -> r[1] -> r[0]...
                x = +!x; // 0 -> 1 -> 0...
            };
            
            var add = function(data) {};
                
                // buffer[r[0]][r[1]].push
            
            return {
                add: add
            };
        }());
        
        // not implemented/exposed
        var get = function(which) {
            return cf[which];
        };
        
        // shimmed
        var set = function(which, what) {
            cf.stream = what;
            //cf[which] = what;
            //return this;
        };
        
        var drop = function() {
            if (cf.vb) console.log('drop', contents.length);
            contents = [];
        };
        
        var wait = function() {
            return new Promise(function(res) {
                if (cf.vb) console.log('pause');
                setTimeout(function() {
                    if (cf.vb) console.log('resume');
                    res();
                }, cf.waitTime);
            });
        };
        
        var insert = function(row) {
            prev.shift();
            contents.push(row);
            row.push(contents.length - 1);
            prev.push(row);
            processed++;
        };
        
        var save = function() {
            if (lastUploaded < contents.length) {
                pushToCloud(lastUploaded, contents.length);
            }
            drop();
        };
        
        var checkBuffer = function() {
            if ((cf.vb) && (contents.length % cf.logmod/100 === 0)) {
                console.log(
                    'buffer',
                    contents.length + '/' + cf.maxAtOnce
                );
            }
            if (contents.length === cf.maxAtOnce) {
                cf.stream.pause();
                save();
                wait();
                cf.stream.resume();
            }
        };
        
        var getBlockSize = function(network) {
            var mask = Number(/\/(\d+)$/.exec(network)[1]);
            var size = Math.pow(2, Math.pow(2, 7) - mask);
            return size

        };
        
        var toDoc = function(row) {
            return {
                coords: {
                    lat: row[0],
                    long: row[1]
                },
                    numIps: row[2]
            };
        };
        
        var pushToCloud = function(last, now) {
            var docs = contents
                .slice(last, now)
                .map(toDoc);
            if (cf.vb) console.log('saving', now - last);
            return CoordFreq.insertMany(docs);
        }
        
        var bSize = 500000;
        var bDone = 0;
        
        var upsert = function() {
            //rewrite promises or async.series
            console.log(uniques);
            var mT = 0;
            var docs = Object.keys(tab)
                .map(function(key) {
                    var temp = Math.log(Math.log(tab[key]['numIps'] + 1) + 1);
                    if (temp > mT) mT = temp;
                    tab[key]['temp'] = temp;
                    return key;
                })
                .map(function(key) {
                    var coords = key.split('&&');
                    return {
                        coords: {
                            lat: coords[0],
                            long: coords[1]
                        },
                        numIps: tab[key]['numIps'],
                        temp: tab[key]['temp'],
                        alpha: ((mT - tab[key]['temp']) / mT)
                    };
                });
            return CoordFreq.insertMany(docs)
                .then(function() {
                    console.log('maybe ok!');
                });
        };
            
            
            
                
        // this one worked?
        /*
        var upsert = function(row) {
            counter++;
            if ((cf.vb) && (counter % cf.logmod === 0)) console.log('parse', counter);
            if (row.network === 'network') {
                return;
            }
            row = [Number(row.lat), Number(row.long), getBlockSize(row.network)]
            if (contents.length === 0) {
                pushToBuffer(row);
                return;
            }
            if (arrayEqual(contents[contents.length - 1].slice(0, 2), row.slice(0, 2))) {
                contents[contents.length-1][2] += row[2];
            } else {
                pushToBuffer(row);
            }
        };
        */
        
        var lastUploaded = 0;
        
        var pushToBuffer = function(row) {
            //console.log(row);
            contents.push(row);
            if (contents.length % cf.savemod === 0) {
                pushToCloud(lastUploaded, contents.length);
                lastUploaded = contents.length;
            }
        };
        
        var toDoc = function(row) {
            return {
                coords: {
                    lat: row[0],
                    long: row[1]
                },
                    numIps: row[2]
            };
        };
        
        var pushToCloud = function(last, now) {
            var docs = contents
                .slice(last, now)
                .map(toDoc);
            if (cf.vb) console.log('saving', now - last);
            CoordFreq.insertMany(docs);
        };
            
        var drain = function() {
            var docs = contents.map(toDoc);
            if (cf.vb) console.log('saving', docs.length);
            CoordFreq.insertMany(docs);
            drop();
        };
        
        return {
            upsert: upsert,
            save: save,
            // get: get,
            set: set
        };
    }());
    
    var getBlockSize = function(network) {
        var mask = Number(/\/(\d+)$/.exec(network)[1]);
        var size = Math.pow(2, Math.pow(2, 7) - mask);
        return size;
    };
    
    // let's just let JS do what it does best
    // and damn can it lookup object keys
    var total = 0;
    var uniques = 0;
    var tab = {}; // after the dry run,
                  // tab[String(lat) + '&&' + String(long)] = numIps
    var hashmod = 10000;
    var hash = function(row) {
        //console.log(row);
        total++;
        if (row.lat === 'latitude') {
            return;
        }
        if (total % hashmod === 0) console.log('t', total, 'u', uniques)
        var key = (String(row.lat) + '&&' + String(row.long));
        var numIps = getBlockSize(row.network);
        if (!tab.hasOwnProperty(key)) {
            tab[key] = {};
            tab[key].lat = row.lat;
            tab[key].long = row.long;
            tab[key].numIps = numIps
            uniques++;
        } else {
            tab[key].numIps += numIps;
        }
    };
    
    var processDoc = function() {
        var maxT = 0;
        var docs = Object.keys(tab)
            .map(function(key) {
                var temp = Math.log(Math.log(tab[key].numIps + 1) + 1);
                if (temp > maxT) {
                    maxT = temp;
                }
                tab[key].temp = temp;
                return key;
            })
            .map(function(key) {
                var alpha = (maxT - tab[key].temp) / maxT;
                tab[key].alpha = alpha;
                return key;
            })
            .map(function(key) {
                var doc = {
                    coords: {
                        lat: tab[key].lat,
                        long: tab[key].long
                    },
                    numIps: tab[key].numIps,
                    temp: tab[key].temp,
                    alpha: tab[key].alpha
                };
                return doc;
            });
        console.log('Saving...');
        return CoordFreq.insertMany(docs)
            .then(function() {
                console.log('Maybe okay!');
            });
            
                
        
    };
        
            
    
    var importCsv = function(dryRun) {
        return new Promise(function(resolve) {
            var dest = path.join(cf.dir, cf.names.csv);
            var filestream = fs
                .createReadStream(dest, {
                    //highWaterMark: 200
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
            
            coordFreqBuffer.set('stream', csvStream);
            
            csvStream
                .on('data', hash)//coordFreqBuffer.upsert)
                .on('end', function() {
                    if (!dryRun) {
                        coordFreqBuffer.save();
                    }
                    console.log('End csv stream');
                    resolve();
                });
        });
    };
    
    var setTemp = function(cf) {
        var up = {
            $set: {
                temp: getTemp(cf.numIps)
            }
        };
        return CoordFreq
            .update({_id: cf._id}, up)
            .exec();
    };
    
    var setTemps = function(cb) {
        console.log('setting temps')
        return CoordFreq
            .find()
            .snapshot()
            .exec()
            .then(function(cfs) {
                return Promise.all(cfs.map(setTemp));
            })
            .catch(function(e) {
                console.log('Error setting temps:');
                console.log(e);
            });
    };
    
    var setAlpha = function(cf, maxTemp) {
        var up = {
            $set: {
                alpha: getAlpha(cf.temp, maxTemp)
            }
        };
        return CoordFreq
            .update({_id: cf._id}, up)
            .exec();
    };
    
    var setAlphas = function(cb) {
        console.log('setting alphas');
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
            .catch(function(e) {
                console.log('Error setting alphas:');
                console.log(e);
            });
    };
    
    var populate = function() {
        return drop()
            .then(importCsv)
            .then(processDoc)
            //.then(setTemps)
            //.then(setAlphas);
            .then(function() {
                console.log('done');
            });
    };
    
    module.exports = populate;
}());
