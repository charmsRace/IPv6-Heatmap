(function() {
    'use strict';

    var mongoose = require('mongoose');
    var CoordFreq = require('../models/coord-freq.js');

    exports.reqBBox = function (req, res) {
        console.log('Received bbox request with params ' + JSON.stringify(req.params));
        var lim;
        console.log(req.query);
        if (req.query.lim) {
            console.log(lim);
            lim = Number(req.query.lim);
            console.log(lim);
        }
        var qs = [
            'lim',
            'inten',
            'head'
        ];

        var params = {
            llng: Number(req.params[0]),
            rlng: Number(req.params[1]),
            dlat: Number(req.params[2]),
            ulat: Number(req.params[3])
        };

        for (var i in qs) {
            if (req.query[qs[i]]) {
                params[qs[i]] = req.query[qs[i]];
            }
        };

        Object
            .keys(params)
            .map(function(key) {
                params[key] = Number(params[key]);
            });

        console.log(params);
        CoordFreq
            .fetchBBox(params)
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
