'use strict';

var path = require('path');

var IPv6 = require('../models/ipv6.js');

module.exports = function(iphm) {
    // server routes
    iphm.get('/api/ipv6', function(req, res) {
        IPv6.find(function(err, ips) {
            if (err) {
                res.send(err);
            }
            res.json(ips);
        });
    });
    //app.post
    //app.put
    //app.delete
    
    // client routes
    iphm.get('*', function(req, res) {
        res.sendFile('index.html', {
            root: path.join(__dirname, '../../client/www')
        });
    });
};
