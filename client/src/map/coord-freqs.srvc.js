(function() {
    angular
        .module('iphm.map', [])
        .factory('CoordFreqs', CoordFreqs);
    
    CoordFreqs.$inject = ['Restangular'];
    
    function CoordFreqs(Restangular) {
        return Restangular.service('coordfreqs');
    }
}());
