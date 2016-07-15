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
    
    // crash at 379000
    // 396000...
    // 441000!
    // several hours later, 884000!
    
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
            mod: 1000,
            hist: 30
        };
        
        // we'll keep track of the last few so we can
        // upsert on the location, since the data
        // appear to be sorted. note these won't be in
        // order, so we'll have to sum up at the end anyway
        var prev = Array(cf.hist).fill(Array(4).fill(null));
        var counter = 0;
        var processed = 0;
        
        var contents = [];
        
        
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
            drain();
            drop();
        };
        
        var checkBuffer = function() {
            if ((cf.vb) && (contents.length % cf.mod/100 === 0)) {
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
            var mask = /\/(\d+)$/.exec(network)[1];
            return Math.pow(2, Math.pow(2, 7) - mask);
        };
        
        var upsert = function(row) {
            counter++;
            if ((cf.vb) && (counter % cf.mod === 0)) console.log('parse', counter);
            if ((cf.vb) && (processed % cf.mod === 0)) console.log('proc', processed);
            if (row.network === 'network') {
                return;
            }
            row = [row.lat, row.long, getBlockSize(row.network)].map(Number);
            
            var which = prev.find(function(old) {
                return arrayEqual(
                    old.slice(0, 2),
                    row.slice(0, 2)
                );
            });
            if (which) {
                //console.log('ex', contents[which[3]]);
                //console.log('nw', row);
                contents[which[3]][2] += row[2];
                processed++;
            } else {
                insert(row);
                //checkBuffer();
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
    
    /*
    var parseRow = function(cb, row) {
        if (counter < 5) {
            console.log(row);
        }
        if (counter % 1000 === 0) {
            times[1] = 0 + Date.now();
            console.log('cou: ', counter, 'pro: ', processed, 'cur: ', current, 't: ', times[1] - times[0], 'q: ', queries);
            times[0] = times[1];
            //console.log(row);
        }
        counter++;
        current++;
        if (row.network === 'network') {
            cb(null);
            return;
        }
        var lat = Number(row.lat);
        var long = Number(row.long);
        var numIps = blockSize(row.network);
        if (lastrow && ((lat === lastrow[0]) && (long === lastrow[1]))) {
            lastrow[2] += numIps;
            cb(null);
        } else {
            queries++;
            upsertCoordFreq(lastrow[0], lastrow[1], lastrow[2])
                .then(function() {
                    if (typeof numIps === 'number') lastrow = [lat, long, numIps];
                    setTimeout(function() {
                        cb(null);
                    }, 1000);
                });
            lastrow = [lat, long, numIps];
        }
    };
    
    /*
    var oldParseRow = function(cb, row, csvStream) {
        if (counter % 1000 === 0) {
            times[1] = 0 + Date.now();
            console.log('cou: ', counter, 'pro: ', processed, 'cur: ', current, 't: ', times[1] - times[0]);
            times[0] = times[1];
            //console.log(row);
        }
        counter++;
        current++;
        /*
        if (show) {
            times.push(Number(0 + Date.now()));
            console.log('c: ', counter, 'n: ', n, 'nM: ', nModified, 'p: ', processed);
        }
        ///
        if (row.network === 'network') {
            cb(null);
            return;
        }
        var lat = Number(row.lat);
        var long = Number(row.long);
        var numIps = blockSize(row.network);
        upsertCoordFreq(lat, long, numIps)
        ///*
            .then(function(res) {
                processed++;
                current--;
                if (res.nModified === 1) nModified++;
                //if (res.n === 1) n++;
                cb(null);
            })
            .catch(function(err) {
                console.log('Error parsing row:');
                console.log(counter, processed, current, nModified, n);
                console.log(err);
            });
        ///
    };
    */
    
    var importCsv = function() {
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
                .on('data', coordFreqBuffer.upsert)
                /*
                .on('data', function(row) {
                    //console.log(row);
                    async.series([
                        /*function(cb) {
                            //if (current >= maxConcurrency) {
                            //    csvStream.pause()
                            //}
                            cb(null);
                        },
                        ///
                        function(cb) {
                            parseRow(cb, row);
                        },
                        /*
                        function(cb) {
                            //if (current < maxConcurrency) {
                            //    csvStream.resume();
                            //}
                            cb(null);
                        }
                        ///
                    ]);
                })
                */
                .on('end', function() {
                    coordFreqBuffer.save();
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
            .then(setTemps)
            .then(setAlphas);
    };
    
    module.exports = populate;
}());
