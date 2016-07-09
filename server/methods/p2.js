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
        console.log(kittens);
    });
    
    var coordFreqSchemaKeyList = [
        'long',
        'lat',
        'numIps',
        'temp',
        'alpha'
    ];
    
    var coordFreqSchema = new mongoose.Schema({
        long: Number,
        lat: Number,
        numIps: {
            type: Number,
            default: 0
        },
        temp: Number,
        alpha: Number
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
    
    var importCsv = function(csvPath, headers, modelName) {
        fastCsv
            .fromPath('./testdat.csv', {headers: true})
            .on('data', function(data) {
                console.log(data);
                var Obj = mongoose.model(modelName);
                var obj = new Obj();
                Object.keys(data).forEach(function(key) {
                    var val = data[key];
                    if (val !== '') {
                        obj.set(key, val);
                    }
                });
                obj.save(function(err) {
                    if (err) {
                        console.log('err111');
                        throw err;
                    }
                });
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
        console.log(coordFreqs);
    });
    
    
    
    
    
    
});
/*
(function() {
    'use strict';

    var mongoose = require('mongoose');
    
    var coordFreqSchema = new mongoose.Schema({
        long: Number,
        lat: Number,
        numIps: Number,
        temp: Number,
        alpha: Number
    });
    
    coordFreqSchema.methods.findSameNum = function(cb) {
        return this.model('CoordFreq').find({type: this.type}, cb);
    };
    
    var CoordFreq = mongoose.model('CoordFreq', coordFreqSchema);

    module.exports = mongoose.model('IPv6', IPv6Schema);
}());
*/
