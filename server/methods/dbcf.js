(function() {
    'use strict';
    
    var path = require('path');
    
    var dbcf = {
        localUri: 'mongodb://localhost/ipv6',
        dir: path.join(__dirname, '../mmdb'),
        baseUrl: 'http://geolite.maxmind.com/download/geoip/database/',
        // a mess because I realized I only needed one db
        db: {
            name: 'GeoLite2 City',
            dirname: 'GeoLite2-City-CSV',
            filename: 'GeoLite2-City-CSV.zip',
            url: 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-City-CSV.zip',
            keep: [
                'GeoLite2-City-Blocks-IPv6.csv',
                'LICENSE.txt',
                'COPYRIGHT.txt'
            ],
            csvname: 'GeoLite2-City-Blocks-IPv6.csv'
        },
        dbs: [
            {
                taskname: 'synccity',
                name: 'GeoLite2 City',
                dirname: 'GeoLite2-City-CSV',
                filename: 'GeoLite2-City-CSV.zip',
                url: 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-City-CSV.zip',
                keep: [
                    'GeoLite2-City-Blocks-IPv6.csv',
                    'LICENSE.txt',
                    'COPYRIGHT.txt'
                ]
            },
            // unnecessary
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
    
    /* (!!) Add some dynamically, maybe later
    for (var i = 0; i < dbcf.dbs.length; i++) {
        var db = dbcf.dbs[i];
        db.filename = db.dirname + '.zip';
        db.md5Url = db.filename + '.md5';
        db.url = dbcf.baseUrl + db.filename;
    }
    */
    
    module.exports = dbcf;
}());
