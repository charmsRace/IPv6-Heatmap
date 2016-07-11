(function() {
    angular
        .module('iphm.map')
        .factory('CoordFreqCtrl', CoordFreqCtrl);
    
    CoordFreqCtrl.$inject = ['$scope', 'Restangular'];
    
    function CoordFreqCtrl() {
        return Restangular.service('coordfreqs');
        
        
        
    }
}());
