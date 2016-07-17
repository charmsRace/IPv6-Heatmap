(function() {
    'use strict';
    
    var validate = require('./validate.js');
    var update = require('./update.js');
    var populate = require('./populate');
    
    var sync = function() {
        return validate()
            .then(function(current) {
                return current
                    ? 'continue'
                    : update().then(populate);
            });
    };
    
    module.exports = sync;
}());