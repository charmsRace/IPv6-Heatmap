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
            return this
                .find()
                .select('coords alpha')
                .where('coords.lat')
                .gte(dlat)
                .lte(ulat)
                .$where(function inLong() {
                    var long = this.coords.long;
                    var within = (llng <= long) && (long <= rlng);
                    var anticlockwise = (llng <= rlng);
                    return within === anticlockwise;
                })
                .lean()
                .exec();
        }
    };
    
    mongoose.model('CoordFreq', CoordFreqSchema);
    
}());
