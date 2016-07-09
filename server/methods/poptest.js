//(function() {
    'use strict';
    
    console.log('start');
    
    var path = require('path');
    var mongoose = require('mongoose');
    console.log('bpath');
    var fs = require('fs');
    console.log('bpath');
    var lineInputStream = require('line-input-stream');
    console.log('bpath');
    var dbcf = require('./dbcf.js');
    
    console.log('bpath');
    var rawPath = path.join(dbcf.dir, dbcf.db.dirname, dbcf.db.csvname);
    console.log('path: ' + rawPath);
    var stream = lineInputStream(fs.createReadStream(rawPath));
    stream.setEncoding('utf8');
    stream.setDelimiter('\n');
    stream
        .on('error', function(err) {
            console.log('Error reading csv filestream: ');
            console.log(err);
        })
        .on('line', processLine)
        .on('end', function() {
            console.log('End csv filestream');
        });
//}());
