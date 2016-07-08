(function() {
    'use strict';

    var path = require('path');
    var express = require('express');

    var IPv6 = require('../models/ipv6.js');

    var root = path.join(__dirname, '../../client/www');
    
    var apiRouter = express.Router();
    
    apiRouter
        .use(function(req, res, next) {
            console.log('API request made: ' + req);
            next();
        })
        .get('/ipv6', function(req, res) {
            IPv6.find(function(err, ips) {
                if (err) {
                    res.send(err);
                }
                res.json(ips);
            });
        });
    
    module.exports = apiRouter;
}());
