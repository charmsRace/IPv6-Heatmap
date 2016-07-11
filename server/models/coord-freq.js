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
            return this
                .find()
                .where('coords.lat')
                .gte(dlat)
                .lte(ulat)
                .$where(longExp)
                .select('coords alpha')
                .lean()
                .exec();
        }
    };
    console.log(3);
    module.exports = mongoose.model('CoordFreq', CoordFreqSchema);
    console.log(2);
}());
