(function() {
    'use strict';
    
    var mongoose = require('mongoose');
    
    var CoordFreqSchema = new mongoose.Schema({
        coords: {
            type: {
                lat: {
                    type: Number
                }, long : {
                    type: Number
                }
            }, index: {
                unique: true
            }
        }, numIps: {
            type: Number,
            default: 0
        }, temp: {
            type: Number,   
            default: 0
        }, alpha: {
            type: Number,
            default: 0
        }, intensity: {
            type: Number,
            default: 0
        }
    });
    
    CoordFreqSchema.statics = {
        fetchBBox: function(llng, rlng, dlat, ulat, lim) {
            // add qs for heatmap
            console.log('inside2');
            console.log('lim:', lim);
            var ls = String(llng);
            var rs = String(rlng);
            var inLong = '((' + ls + ' <= this.coords.long)' // I am
                + ' && (this.coords.long <= ' + rs + '))'     // *so*
                + ' === (' + ls + ' <= ' + rs + ')';          // sorry
            // mongo has some *serious* problem with this kind of query...
            // it's extremely hard to compare two values of the same property
            // kind of blows my mind you have to eval() JS to do it
            // even though it's just a === or XOR...
            // $where is quite slow, so there's more thinking to be done
            //
            // I don't know whether a 2d-geospatial would even be more
            // efficient when the intersecting/bounding region is just
            // a rectangle and there is no complication in the geometry
            // 
            // but I'll configure it at some point to see
            //
            return this
                
                .find()
                
                .where('coords.lat')
                .gte(dlat)
                .lte(ulat)
                .$where(inLong)
                .select('-_id coords numIps intensity')
                .lean()
                //.limit(lim)
                
                .exec();
        }
    };
    
    module.exports = mongoose.model('CoordFreq', CoordFreqSchema);
    
}());
