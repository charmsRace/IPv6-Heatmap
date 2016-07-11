(function() {
    'use strict';

    var express = require('express');
    var path = require('path');
    var coordFreqs = require('../controllers/coordFreqs.js');
    
    /* used?
    var handleError = function(res, reason, message, code) {
        console.log('Routing error: ' + reason);
        res.status(code || 500).json({'error': message});
    };
    */
    
    var lngRE = '([+-]?(?:\\d{0,3}\\.\\d+|\\d{1,3}))';
    var latRE = '([+-]?(?:\\d{0,2}\\.\\d+|\\d{1,2}))';
    var coordApiRE = new RegExp(
        '^\\/'
            + 'llng=' + lngRE
            + '&rlng=' + lngRE
            + '&dlat=' + latRE
            + '&ulat=' + latRE
        + '$'
    );
    
    var apiRouter = express.Router();
    
    apiRouter
        .use(function(req, res, next) {
            console.log('API request made: ' + req);
            next();
        })
        .get(coordApiRE, coordFreqs.reqBBox);
        .use(function(err, req, res, next) {
            console.log('API request made: ' + req);
            next();
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
        .use(function(req, res) {
            res
                .status(500)
                .render('500', {});
        });
        
    module.exports = apiRouter;
}());
