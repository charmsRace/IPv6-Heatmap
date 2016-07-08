(function() {
    'use strict';

    var path = require('path');
    var express = require('express');
    var root = path.join(__dirname, '../../client/www');
    
    var siteRouter = express.Router();
    
    siteRouter
        .use(function(req, res, next) {
            console.log('Site request made: ' + req);
        })
        .get('*', function(req, res) {
            res.sendFile('/index.html', {
                root: root
            });
        });
    
    module.exports = siteRouter;
}());
