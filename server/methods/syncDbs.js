(function() {
    'use strict';
    
    var request = require('request');
    var path = require('path');
    var fs = require('fs');
    var md5 = require('md5');
    var unzip = require('unzip-wrapper');
    var glob = require('glob');
    var del = require('del');
    var sequence = require('run-sequence');
    var dbcf = require('./dbcf.js');
    
    var getLocalMd5 = function(db) {
        var md5 = undefined;
        try {
            md5 = fs.readFileSync(path.join(dbcf.dir, db.filename), {encoding: 'ascii'});
            console.log('Local md5 for ' + db.filename + ': ' + md5);
        } catch (err) {
            console.log('!! Couldn\'t read local md5 for ' + db.filename + '; error:\n');
            console.log(err);
        }
        return md5;
    };
    
    var getLiveMd5 = function(db) {
        request(db.url + '.md5', function(error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log('Live md5 for ' + db.filename + ': ' + body);
                return body;
            }
            console.log('!! Error getting the live md5 for ' + db.filename + '; error:\n');
            throw err;
        });
    };
    
    var verifyMd5 = function(db) {
        return getLocalMd5(db) === getLiveMd5(db);
    };
    
    var exists = function(db) {
        try {
            var stats = fs.statSync(path.join(dbcf.dir, db.filename));
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
    
    var downloadDb = function(db) {
        request
            .get(db.url)
            .on('error', function(err) {
                console.log('!! Error downloading ' + db.filename + '; error: \n');
                console.log(err);
            })
            .pipe(fs.createWriteStream(path.join(dbcf.dir, db.filename)));
        console.log('Downloaded ' + db.filename);
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
    
    var syncDb = function(db) {
        return function() {
            console.log('Began syncing ' + db.name);
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
            renameDir(db);
            pruneDb(db);
            console.log('Done syncing ' + db.name);
        };
    };
    
    module.exports = syncDb;
}());
