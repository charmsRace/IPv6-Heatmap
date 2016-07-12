(function() {
    'use strict';

    var express = require('express');
    var path = require('path');
    var coordFreqs = require('../controllers/coord-freqs.js');
    
    /* used?
    var handleError = function(res, reason, message, code) {
        console.log('Routing error: ' + reason);
        res.status(code || 500).json({'error': message});
    };
    */
    
    var maybeSlash = '(?:\\/)?';
    var lngRE = '([+-]?(?:\\d{0,3}\\.\\d+|\\d{1,3}))';
    var latRE = '([+-]?(?:\\d{0,2}\\.\\d+|\\d{1,2}))';
    var coordApiRE = new RegExp(
        '^' + maybeSlash + 'coord-freqs'
            + '&llng=' + lngRE
            + '&rlng=' + lngRE
            + '&dlat=' + latRE
            + '&ulat=' + latRE
        + maybeSlash + '$'
    );
    
    // /^(?:\/)?coord-freqs&llng=([+-]?(?:\d{0,3}\.\d+|\d{1,3}))&rlng=([+-]?(?:\d{0,3}\.\d+|\d{1,3}))&dlat=([+-]?(?:\d{0,2}\.\d+|\d{1,2}))&ulat=([+-]?(?:\d{0,2}\.\d+|\d{1,2}))(?:\/)?$/
    
    var apiRouter = express.Router();
    
    apiRouter
        .use(function(req, res, next) {
            console.log('API request made');
            next();
        })
        .get(coordApiRE, function(req, res) {
            // note getting by RegExp doesn't name the parameters...
            // they're just req.params[0-3].
            // name them here, and also validate
            coordFreqs.reqBBox(req, res)
        })
        .use(function(err, req, res, next) {
            if (~err.message.indexOf('not found')) {
                res
                    .status(404)
                    .render('404', {});
                return next();
            }
            return;
        })
        .use(function(err, req, res, next) {
            res
                .status(500)
                .render('500', {});
        });
        
    module.exports = apiRouter;
}());
