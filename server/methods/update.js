(function() {
    'use strict';
    
    var del = require('del');
    var path = require('path');
    var Promise = require('bluebird');
    var fs = Promise.promisifyAll(require('fs'));
    var request = require('then-request');
    
    var cf = require('./cf.js');
    
    var wipe = function() {
        return del([
            cf.dir + '/**',
            '!' + cf.dir
        ], {
            dryRun: true
        }).then(function(paths) {
            console.log('Deleted:\n', paths.join('\n'));
            return;
        });
    };
    
    var download = function() {
        var dest = path.join(cf.dir, cf.names.zip);
        return request('GET', cf.url + cf.names.zip)
            .getBody(null)
            .then(function(data) {
                console.log(data);
                return fs.writeFile(dest+'test', data);
            })
            .then(function() {
                console.log('done!?');
            });
    };
    
    var genMd5 = function() {
        
        
    };
    
    var unzip = function() {
        
        
    };
    
    var rename = function() {
        
        
    };
    
    var move = function() {
        
        
    };
    
    var prune = function() {
        
        
    };
    
    var update = function() {
        return wipe()
            .then(download)
            .then(genMd5)
            .then(unzip)
            .then(rename)
            .then(move)
            .then(prune);
    };
   
    module.exports = update;
}());
