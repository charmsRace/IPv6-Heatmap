(function() {
    'use strict';
    
    var path = require('path');
    
    var dbcf = {
        dir: path.join(__dirname, '../mmdb'),
        dbs: [
            {
                taskname: 'synccity',
                name: 'GeoLite2 City',
                dirname: 'GeoLite2-City-CSV',
                filename: 'GeoLite2-City-CSV.zip',
                url: 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-City-CSV.zip',
                keep: [
                    ''
                ]
            },
            {
                taskname: 'synccountry',
                name: 'GeoLite2 Country',
                dirname: 'GeoLite2-Country-CSV',
                filename: 'GeoLite2-Country-CSV.zip',
                url: 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country-CSV.zip',
                keep: [
                    ''
                ]
            }
        ]
    };
    
    module.exports = dbcf;
}());
