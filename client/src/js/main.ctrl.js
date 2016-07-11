(function() {
    'use strict';
    
    angular
        .module('iphm.view', [])
        .controller('MainCtrl', MainCtrl);
    
    MainCtrl.$inject = [
        '$rootScope',
    ];
    
    function MainCtrl($rootScope) {
        $rootScope.tagline = 'foo!';
    }
}());
