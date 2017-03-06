(function() {
    'use strict';

    var path = require('path');

    var serveStatic = require('serve-static');

    var options = {
        fallback: false,
        index: false
    };

    var root = path.join(__dirname, '../..')

    var rawRouter = serveStatic(root, options);

    module.exports = rawRouter;
}());
