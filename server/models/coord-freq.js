(function() {
    'use strict';
    
    var mongoose = require('mongoose');
    
    var CoordFreqSchema = new mongoose.Schema({
        coords: {
            type: {
                lat: {
                    type: Number
                },
                long: {
                    type: Number
                }
            }
        },
        numIps: {
            type: Number,
            default: 0
        },
        temp: {
            type: Number,
            default: 0
        },
        alpha: {
            type: Number,
            default: 0
        }
    });
    
    CoordFreqSchema.statics = {
        fetchBBox: function(llng, rlng, dlat, ulat) {
            console.log('inside');
            var ls = String(llng);
            var rs = String(rlng);
            var longExp = '((' + ls + ' <= this.coords.long)' // I am
                + ' && (this.coords.long <= ' + rs + '))'     // *so*
                + ' === (' + ls + ' <= ' + rs + ')';          // sorry
            // mongo has some *serious* problem with this kind of query...
            // it's extremely hard to compare two values of the same property
            // kind of blows my mind you have to eval() JS to do it
            // even though it's just a === or XOR...
            // $where is quite slow, so there's more thinking to be done
            return this
                .find()
                .where('coords.lat')
                .gte(dlat)
                .lte(ulat)
                .$where(longExp)
                .select('-_id coords alpha')
                .lean()
                .exec();
        }
    };
    
    module.exports = mongoose.model('CoordFreq', CoordFreqSchema);
    
}());
