(function() {
    'use strict';
    
    // Probably need to write all of this as gulp tasks
    // so I can use run-sequence...
    
    var request = require('request');
    var path = require('path');
    var fs = require('fs');
    var crypto = require('crypto');
    var unzip = require('unzip-wrapper');
    var glob = require('glob');
    var del = require('del');
    var sequence = require('run-sequence');
    var dbcf = require('./dbcf.js');
    
    var getLocalMd5 = function(db) {
        var md5;
        try {
            md5 = fs.readFileSync(path.join(dbcf.dir, db.filename + '.md5'), {encoding: 'ascii'});
            console.log('Local md5 for ' + db.filename + ': ' + md5);
        } catch (err) {
            console.log('!! Couldn\'t read local md5 for ' + db.filename);
        }
        return md5;
    };
    
    var getLiveMd5 = function(db) {
        var md5;
        request(db.url + '.md5', function(err, response, body) {
            if (!err && response.statusCode === 200) {
                console.log('Live md5 for ' + db.filename + ': ' + body);
                md5 = body;
                return;
            }
            console.log('!! Error getting the live md5 for ' + db.filename + '; error:\n');
            throw err;
        });
        return md5;
    };
    
    var verifyMd5 = function(db) {
        var local = getLocalMd5(db);
        var live = getLiveMd5(db);
        return (local && (local === live));
    };
    
    var db = dbcf.dbs[0];
    console.log('Starting r');
    request
        .get(db.url)
        .on('response', function(res) {
            console.log('code ' + res.statusCode);
        })
        .pipe(fs.createWriteStream(path.join(dbcf.dir, db.filename)));
    console.log('ending r');
    
    var downloadDb = function(db) {
        request
            .get(db.url)
            .on('response', function(res) {
                console.log('GET ' + db.url + ' status code: ' + res.statusCode);
                console.log(res.headers['content-type']);
            })
            .on('error', function(err) {
                console.log('!! Error downloading ' + db.filename + '; error: \n');
                console.log(err);
            })
            .pipe(fs.createWriteStream(path.join(dbcf.dir, db.filename)));
        console.log('Downloaded ' + db.filename);
    };
    
    var genMd5 = function(db) {
        var dbpattern = dbcf.dir + '/' + db.dirname + '_*[0-9].zip';
        glob(dbpattern, function(err, files) {
            if (err) {
                console.log('Error globbing ' + dbpattern + '; error\n');
                console.log(err);
                return;
            }
            var hash = crypto.createHash('md5');
            fs
                .createReadStream(files[0])
                .on('data', function(data) {
                    hash.update(data, 'utf8');
                })
                .on('end', function() {
                    var checksum = hash.digest('hex');
                    console.log('New ' + db.filename + '.md5: ' + checksum);
                    fs.writeFile(path.join(dbcf.dir, db.filename) + '.md5', checksum, function(err) {
                        if (err) {
                            console.log('Error writing ' + db.filename + '.md5; error:\n');
                            console.log(err);
                            return;
                        }
                        console.log('Wrote ' + db.filename + '.md5');
                    });
                });
        });
    };
    
    var exists = function(db) {
        var stats;
        try {
            stats = fs.statSync(path.join(dbcf.dir, db.filename));
        } catch (err) {
            console.log(db.filename + ' not found');
            return false;
        }
        console.log('Confirmed existence of ' + db.filename);
        return stats.isFile();
    };
    
    var wipeDb = function(db) {
        del([
            dbcf.dir + '/' + db.filename,
            dbcf.dir + '/' + db.dirname + '_*[0-9]'
        ], {
            force: true
        }).then(function(path) {
            console.log('Deleted files and folders:\n' + paths.join('\n'));
        });
    };
    
    var unzipDb = function(db) {
        unzip(path.join(dbcf.dir, db.filename), {}, function(err) {
            if (err) {
                console.log('!! Error unzipping ' + db.filename + '; error: \n');
                console.log(err.message);
                return;
            }
            console.log('Done unzipping ' + db.filename);
        });
    };
    
    /*
    var deleteZip = function(db) {
        return 'pass';
    };
    */
    
    var renameDir = function(db) {
        var dbpattern = dbcf.dir + '/' + db.dirname + '_*[0-9]';
        glob(dbpattern, function(err, files) {
            if (err) {
                console.log('Error globbing ' + dbpattern + '/; error:\n');
                console.log(err);
                return;
            }
            fs.rename(files[0], path.join(dbcf.dir, db.dirname), function(err) {
                if (err) {
                    console.log('Error renaming ' + db.dirname + '; error\n');
                    console.log(err);
                    return;
                }
                console.log('Renamed ' + db.dirname);
            });
        });
    };

    var pruneDb = function(db) {
        'pass';
    };
    
    var syncDb = function(db) {
        return function() {
            console.log('Began syncing ' + db.name);
            console.log('local ' + getLocalMd5(db) + ' live ' + getLiveMd5(db));
            if (verifyMd5(db)) {
                console.log(db.filename + ' is up-to-date');
                return;
            }
            console.log(db.filename + ' is out-of-date');
            if (exists(db)) {
                wipeDb(db);
            }
            downloadDb(db);
            genMd5(db);
            if (!verifyMd5(db)) {
                console.log('New ' + db.filename + '.md5 does not match, aborting...');
                return;
            }
            unzipDb(db);
            //deleteZip(db);
            renameDir(db);
            pruneDb(db);
            console.log('Done syncing ' + db.name);
        };
    };
    
    module.exports = syncDb;
}());
