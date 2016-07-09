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
