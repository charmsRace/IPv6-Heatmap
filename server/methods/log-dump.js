(function() {
    'use strict';
    
    var mongoose = require('mongoose');
    
    var CoordFreq = mongoose.model('CoordFreq');
    
    var dump = function() {
        CoordFreq
            .find()
            .snapshot()
            .exec()
            .then(function(cfs) {
                console.log(cfs.join('\n'));
                return;
            });
    };
    
    module.exports = dump;
}());
