(function() {
    'use strict';
    
    var mongoose = require('mongoose');
    var CoordFreq = require('../models/coord-freq.js');
    
    exports.reqBBox = function (req, res) {
        console.log('Received bbox request with params ' + JSON.stringify(req.params));
        console.log('qs?:', req.query.lim);
        console.log('num:', Number(req.query.lim));
        var lim;
        console.log(lim);
        if (req.query.lim) {
            console.log(lim);
            lim = Number(req.query.lim);
            console.log(lim);
        }
        var llng = Number(req.params[0]);
        var rlng = Number(req.params[1]);
        var dlat = Number(req.params[2]);
        var ulat = Number(req.params[3]);
        console.log('outgoing lim:', lim);
        CoordFreq
            .fetchBBox(llng, rlng, dlat, ulat, lim)
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
