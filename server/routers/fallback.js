(function() {
    'use strict';
    
    var express = require('express');
    var path = require('path');
    var root = path.join(__dirname, '../../client/www');
    
    var fallbackRouter = express.Router();
    
    fallbackRouter
        .use(function(req, res, next) {
            console.log('Fallback');
            next();
        })
        .get('*', function(req, res) {
            res.sendFile('/index.html', {
                root: root
            });
        });
    
    module.exports = fallbackRouter;
}());
