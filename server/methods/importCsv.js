(function() {
    'use strict';
    
    var fastCsv = require('fast-csv');
    
    var importCsv = function(csvPath, headers, modelName) {
        fastCsv
            .fromPath(filePath, {headers: true})
            .on('data', function(data) {
                console.log(data);
                var Obj = mongoose.model(modelName);
                var obj = new Obj();
                Object.keys(data).forEach(function(key) {
                    var val = data[key];
                    if (val !== '') {
                        obj.set(key, val);
                    }
                });
                obj.save(function(err) {
                    if (err) {
                        console.log('err111');
                        throw err;
                    }
                });
            })
            .on('end', function() {
                console.log('end11133');
            });
    };
}());
