(function() {
    'use strict';

    var express = require('express');

    var loggingRouter = express.Router();

    loggingRouter
        .use(function(req, res, next) {
            console.log('%s %s %s', req.method, req.url, req.path);
            next();
        });

    module.exports = loggingRouter;
}());
