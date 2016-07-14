(function() {
    'use strict';
    
    var path = require('path');
    
    var uri = process.env.MONGODB_URI; // mongodb://localhost/ipv6
    
    var connectOptions = {};
    
    var dir = path.join(__dirname, '../mmdb');
    
    var baseUrl = 'http://geolite.maxmind.com/download/geoip/database/';
    
    var names = {
        dir: 'GeoLite2-City-CSV',
        zip: 'GeoLite2-City-CSV.zip',
        md5: 'GeoLite2-City-CSV.zip.md5',
        csv: 'GeoLite2-City-Blocks-IPv6.csv' // only one table is needed
    };
    
    var keep = [
        names.csv,
        'LICENSE.txt',
        'COPYRIGHT.txt'
    ];
    
    module.exports = {
        uri: uri,
        url: baseUrl,
        options: connectOptions,
        dir: dir,
        names: names,
        keep: keep
    };
}());
