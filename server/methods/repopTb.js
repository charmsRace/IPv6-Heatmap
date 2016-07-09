var path = require('path');
var mongoose = require('mongoose');
var fs = require('fs');
var lineInputStream = require('line-input-stream');
var fastCsv = require('fast-csv');
var async = require('async');

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    
    var kittySchema = mongoose.Schema({
        name: String
    });
    
    kittySchema.methods.speak = function() {
        var greeting = this.name
            ? 'Meow name is ' + this.name
            : 'I don\'t have a name';
        console.log(greeting);
    };
    
    var Kitten = mongoose.model('Kitten', kittySchema);
    
    var silence = new Kitten({name: 'Silence'});
    console.log(silence.name);
    
    var fluffy = new Kitten({name: 'Fluffy'});
    
    fluffy.save(function(err, fluffy) {
        if (err) {
            return console.error(err);
        }
        fluffy.speak();
    });
    
    Kitten.find(function(err, kittens) {
        if (err) {
            return console.error(err);
        }
        //console.log(kittens);
    });
    
    var coordFreqSchemaKeyList = [
        'long',
        'lat',
        'numIps',
        'temp',
        'alpha'
    ];
    
    var coordFreqSchema = new mongoose.Schema({
        coords: {
            type: {
                long: {
                    type: Number
                },
                lat: {
                    type:Number
                }
            },
            unique: true
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
            min: 0,
            max: 1
        }
    });
    /*
    coordFreqSchema.methods.findSameNum = function(cb) {
        return this.model('CoordFreq').find({numIps: this.numIps + 1}, cb);
    };
    */
    
    var CoordFreq = mongoose.model('CoordFreq', coordFreqSchema);
    
    // to populate async, fiddle with later
    /*
    var bulk = CoordFreq.collection.initializeOrderedBulkOp();
    var counter = 0;
    
    var stream = lineInputStream(fs.createReadStream('./testdat.csv'));
    stream.setEncoding('utf8');
    stream.setDelimiter('\n');
    var bulk = CoordFreq.collection.initializeOrderedBulkOp();
    var counter = 0;
    var ccounter = 0;
    stream
        .on('error', function(err) {
            console.log('error 1');
            throw err;
        })
        stream.on('line', function(line) {
            console.log(line);
            var row = line.split(',');
            var obj = {};
            bulk.insert(obj);
            console.log('lll');
            counter++;
            if (counter % 1000 === 0) {
                ccounter++;
                console.log(ccounter);
                stream.pause();
                bulk.execute(function(err, res) {
                    if (err) {
                        console.log('error 2');
                        throw err;
                    }
                    bulk = CoordFreq.collection.initializeOrderedBulkOp();
                    stream.resume();
                });
            }
        })
        stream.on('end', function() {
            console.log('stream end');
            if (counter % 1000 !== 0) {
                bulk.execute(function(err, res) {
                    if (err) {
                        console.log('error 3');
                        throw err;
                    }
                });
            }
        });
    */
    
    /*
    network: 1
    lat: 8
    long 9
    */
    
    var blockSize = function(network) {
        try {
            var mask = /\/(\d+)$/.exec(network)[1];
            console.log(mask);
        } catch(err) {
            console.log('Error finding mask of network ' + network);
            throw err;
        }
        return Math.pow(2, Math.pow(2, 7) - mask);
    };
    
    var importCsv = function(csvPath, headers, modelName) {
        var stream = fastCsv.fromPath('./testip.csv', {
            headers: [
                'network', //  1 network
                ,          //  2 geoname_id
                ,          //  3 registered_country_geoname_id
                ,          //  4 reoresented_country_geoname_id
                ,          //  5 is_anonymous_proxy
                ,          //  6 is_satellite_provider
                ,          //  7 postal_code
                'lat',     //  8 latitude
                'long',    //  9 longitude
                ,          // 10 accuracy_radius
            ]
        });
        stream
            .on('data', function(row) {
                stream.pause();
                console.log('n ' + row.network);
                console.log(row.network === 'network');
                if (row.network !== 'network') {
                    console.log(blockSize(row.network));
                    var newIps = blockSize(row.network);
                    var query = {
                        long: row.long,
                        lat: row.lat
                    };
                    var update = {
                        $add: {
                            numIps: newIps
                        }
                    };
                    var options = {
                        upsert: true
                    }
                    CoordFreq.findOneAndUpdate(query, update
                }
                
                
                
                stream.resume();
                
                /*
                console.log('test2');
                console.log(blockSize(row.network));
                var Obj = mongoose.model(modelName);
                var obj = new Obj();
                Object.keys(data).forEach(function(key) {
                    var val = data[key];
                    if (val !== '') {
                        obj.set(key, val);
                    }
                });
                */
                
                /*
                obj.save(function(err) {
                    if (err) {
                        console.log('err111');
                        throw err;
                    }
                });
                */
            })
            .on('end', function() {
                console.log('end11133');
            });
    };
    
    var csvHeaders = [
        'long',
        'lat',
        'numIps',
        'temp',
        'alpha'
    ];
    
    importCsv('./testdat.csv', csvHeaders, 'CoordFreq');
    
    CoordFreq.find(function(err, coordFreqs) {
        if (err) {
            return console.error(err);
        }
        //console.log(coordFreqs);
    });
    
    
    
    
    
    
});
