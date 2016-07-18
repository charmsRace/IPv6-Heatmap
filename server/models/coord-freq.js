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
    /*
    {
        llng : ,
        rlng : ,
        dlat : ,
        ulat : ,
        lim : ,
        inten : ,
        head : ,
        dig : ,
        nl : 
    }
    */
    
    
    
    CoordFreqSchema.statics = {
        fetchBBox: function(params) {
            // add qs for heatmap
            var p = params;
            var tabulate = function(cfs) {
                var third = p.inten ? 'intensity' : 'numIps';
                var selector = '-_id coords ' + third;
                var thirdName = p.inten ? 'Intensity' : 'Num. IPs';
                var list = p.head ? [['Latitude', 'Longitude', thirdName]] : [];
                var linearize = function(cf) {
                    return [
                        cf.coords.lat,
                        cf.coords.long,
                        cf[third]
                    ];
                };
                var next = function(list, cf) {
                    list.push(linearize(cf));
                    return list;
                }
                return cfs.reduce(next, list);
            };
            
            var ls = String(p.llng);
            var rs = String(p.rlng);
            var inLong = '((' + ls + ' <= this.coords.long)' // I am
                + ' && (this.coords.long <= ' + rs + '))'     // *so*
                + ' === (' + ls + ' <= ' + rs + ')';          // sorry
            // 
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
                .gte(p.dlat)
                .lte(p.ulat)
                .$where(inLong)
                .select('-_id coords numIps intensity')
                .lean()
                .limit(p.lim)
                
                .exec()
                .then(tabulate);
        }
    };
    
    /* old api
    [{"coords":{"long":168.3764,"lat":-46.4382},"intensity":0.7235620261894251,"numIps":1.8133887294219438e+24},{"coords":{"long":168.35,"lat":-46.4},"intensity":0.7093308515028848,"numIps":6.044629098073146e+23},{"coords":{"long":168.3722,"lat":-46.3894},"intensity":0.7487689053961837,"numIps":1.2693721105953606e+25},{"coords":{"long":168.3333,"lat":-46.15},"intensity":0.7093308515028848,"numIps":6.044629098073146e+23},{"coords":{"long":170.4912,"lat":-45.9059},"intensity":0.7345377307096435,"numIps":4.231240368651202e+24}]
    */
    
    module.exports = mongoose.model('CoordFreq', CoordFreqSchema);
    
}());
