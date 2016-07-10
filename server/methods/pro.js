var Promise = require('bluebird');

/*
            .then(function(cfs) {
                cfs.forEach(function setTemp(cf) {
                    CoordFreq
                        .update(
                            {
                                _id: cf._id
                            },
                            {
                                $set: {
                                    temp: temp(cf.numIps)
                                }
                            }
                        )
*/
/*
var x;
Promise
    .resolve('foo')
    .then(function(foo) {
        x = 23;
    })
    .then(function(s,x,c,v,d) {
        console.log(typeof d);
    });
*/
var foo = function() {
    return Promise.resolve(2 +3);
};

foo()
    .then(function(v) {
        console.log(v);
    });

var async = require('async');


    
