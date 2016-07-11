(function() {
    'use strict';
    
    var mongoose = require('mongoose');
    var co = require('co');
    var rs;//respond
    var CoordFreq = mongoose.model('CoordFreq');
    
    exports.reqBBox = co.wrap(function* (req, res, next) {
        // validate req.params
        var [llng, rlng, dlat, ulat] = req.params;
        var coordFreqs = yield CoordFreq.fetchBBox(llng, rlng, dlat, ulat);
        res.json(obj);
    });
}());
