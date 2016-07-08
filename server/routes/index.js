(function() {
    'use strict';

    var path = require('path');

    var IPv6 = require('../models/ipv6.js');

    var root = path.join(__dirname, '../../client/www');
    
    module.exports = function(router) {
        router.use(function(req, res, next) {
            console.log('Request made: ' + req);
            next();
        });
        
        router.get('/api/ipv6', function(req, res) {
            IPv6.find(function(err, ips) {
                if (err) {
                    res.send(err);
                }
                res.json(ips);
            });
        });
        
        router.post('/api/ipv6', function(req, res) {
            var ipv6 = new IPv6();
            ipv6.name = req.body.name;
            ipv6.save(function(err) {
                if (err) {
                    res.send(err);
                }
                res.json({message: 'ipv6 created with name' + req.body.name});
            });
        });
        
        //post
        //put
        //delete
        router.get('*', function(req, res) {
            res.sendFile('/index.html', {
                root: root
            });
        });
    };
}());
