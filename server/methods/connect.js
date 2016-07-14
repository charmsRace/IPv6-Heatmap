(function() {
    'use strict';
    
    var mongoose = require('mongoose');
    
    var cf = require('./cf.js');
    
    var connectOnce = function() {
        return mongoose
            .connect(cf.uri, cf.options)
            .connection
            .on('error', console.log);
    };
    
    module.exports = function() {
        return connectOnce()
            //.on('disconnected', connectOnce);
    };
}());
