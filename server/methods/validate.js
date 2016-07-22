(function() {
    'use strict';
    
    var fs = require('fs');
    var path = require('path');
    var request = require('then-request');
    
    var cf = require('./cf.js');
    
    // rewrite async
    var getLocalMd5 = function() {
        var md5;
        //try{
            var where = path.join(cf.dir, cf.names.md5);
            md5 = fs.readFileSync(where, {encoding: 'ascii'});
            console.log('Local md5 for ' + cf.names.zip + ': ' + md5);
        //} catch (e) {
        //    console.log('!! Couldn\'t read local md5 for ' + cf.names.zip);
        //}
        return md5;
    };
    
    var getLiveMd5 = function() {
        return request('GET', cf.url + cf.names.md5)
            .getBody('ascii')
            .then(function(md5) {
                console.log('Live md5 for ' + cf.names.zip + ': ' + md5);
                return md5;
            });
    };
    
    var verifyMd5 = function() {
        var local = getLocalMd5();
        return getLiveMd5()
            .then(function(live) {
                console.log(local && (local === live));
                return (local && (local === live));
            });
    };
    
    module.exports = verifyMd5;
}());
