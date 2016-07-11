(function() {
    'use strict';

    var express = require('express');
    var path = require('path');
    var root = path.join(__dirname, '../../client/www');
    
    var siteRouter = express.Router();
    
    siteRouter
        .use(function(req, res, next) {
            console.log('Site request made: ' + req.params);
            next();
        })
        .get('*', function(req, res) {
            console.log('fallback');
            res.sendFile('/index.html', {
                root: root
            });
        });
    
    module.exports = siteRouter;
}());
