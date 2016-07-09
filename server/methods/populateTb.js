(function() {
    'use strict';
    
    var mongose = require('mongoose');
    var fs = require('fs');
    var lineInputStream = require('line-input-stream');
    var dbcf = require('./dbcf.js');
    
    var createTb = function() {
        /*
        CREATE TABLE ipv6 (
            long FLOAT,
            lat FLOAT,
            number_ips INTEGER,
            temp FLOAT,
            alpha FLOAT
        );
        */
        return tab;
    };
    
    var rawDat = parseCsv(localDb);
    
    var networkSize = function(network) {
        var mask = '/*[0-9]';
        return Math.pow(Math.pow(2, 7) - mask);
    };
    
    var isNew = function(long, lat) {
        return (long, lat) in tab;
    };
    
    var findRow = function(long, lat) {
        return row;
    };
    
    var processLine = function(line) {
        console.log(line);
    };
    
    for (row in rawDat[1:]) {
        if isNew(row.long, row.lat) {
            addTbRow(row.long, row.lat, networkSize(row.network), null, null);
        } else {
            var oldRow = findRow(row.long, row.lat);
            oldRow.number_ips += networkSize(row.network);
        }
    };
    var rawPath = path.join(dbcf.dir, dbcf.db.dirname, dbcf.db.csvname);
    var stream = lineInputStream(fs.createReadStream(rawPath));
    stream
        .setEncoding('utf8');
        .setDelimiter('\n');
        .on('error', function(err) {
            console.log('Error reading csv filestream: ');
            console.log(err);
        })
        .on('line', processLine)
        .on('end', function() {
            console.log('End csv filestream');
        });
    
    var populateTb = function(tb) {
        return function() {
            if (exists(Tb)) {
                drop(Tb);
            }
        };
    };
    
    module.exports
    
