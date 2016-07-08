angular
    .module('iphm.main', [])
    .controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['$rootScope'];

function MainCtrl($rootScope) {
    $rootScope.tagline = 'Testing...';
}
