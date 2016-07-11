(function() {
    'use strict';
    
    var mongoose = require('mongoose');
    var co = require('co');
    var rs;//respond
    var CoordFreq = require('../models/coord-freq.js');
    
    exports.reqBBox = function (req, res) {
        console.log('Received bbox request with params ' + JSON.stringify(req.params));
        var llng = Number(req.params[0]);
        var rlng = Number(req.params[1]);
        var dlat = Number(req.params[2]);
        var ulat = Number(req.params[3]);
        CoordFreq
            .fetchBBox(llng, rlng, dlat, ulat)
            .then(function(cfs) {
                res.json(cfs);
            })
            .catch(function(err) {
                console.log('Error fetching bbox:');
                console.log(err);
            });
        // validate req.params
        /*
        var [llng, rlng, dlat, ulat] = req.params;
        var coordFreqs = yield CoordFreq.fetchBBox(llng, rlng, dlat, ulat);
        console.log('after');
        res.json(coordFreqs);
        */
    };
}());
