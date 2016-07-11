(function() {
    var bBoxQuery = function(llng, rlng, dlat, ulat) {
        return CoordFreq
            .find()
            .select('coords alpha')
            .where('coords.lat')
            .gte(dlat)
            .lte(ulat)
            .$where(function inLong() { // probably performance-heavy
                var long = this.coords.long
                return ((llng <= long) && (long <= rlng)) === (llng <= rlng);
            })
            .lean();
    };
    
    var fetchBBox = function(llng, rlng, dlat, ulat) {
        CoordFreq
            .find()
            .select('coords alpha')
            .where('coords.lat')
            .gte(dlat)
            .lte(ulat)
            .$where(function inLong() { // probably performance-heavy
                var long = this.coords.long
                return ((llng <= long) && (long <= rlng)) === (llng <= rlng);
            })
            .lean()
            mongoos
    
    module.exports = 
}());
