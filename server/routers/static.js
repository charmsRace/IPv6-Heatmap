(function() {
    'use strict';

    var path = require('path');

    var serveStatic = require('serve-static');

    var options = {
        index: false
    };

    var root = path.join(__dirname, '../../client/www');

    var staticRouter = serveStatic(root, options);

    module.exports = staticRouter;
}());
