(function() {
    'use strict';
    
    var mongoose = require('mongoose');
    
    var CoordFreq = mongoose.model('CoordFreq');
    
    var drop = function() {
        return CoordFreq
            .find()
            .remove()
            .exec();
    };
    
    module.exports = drop;
    
}());
