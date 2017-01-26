(function() {
    'use strict';
    
    var path = require('path');
    var fs = require('fs');
    
    var modelDir = path.join(__dirname, '../models');
    
    fs
        .readdirSync(modelDir)
        .filter(function(file) {
            return ~file.search(/^[^\.].*\.js$/);
        })
        .forEach(function(file) {
            require(path.join(modelDir, file));
        });
    
    var cf = require('./cf.js');
    //var models = require('./models.js');
    var connect = require('./connect.js');
    var drop = require('./drop.js');
    var sync = require('./sync.js');
    var populate = require('./populate.js');
    var log = require('./log-dump.js');
    
    module.exports = {
        cf: cf,
        connect: connect,
        drop: drop,
        sync: sync,
        populate: populate,
        log: log
    };
}());
