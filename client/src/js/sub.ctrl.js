angular
    .module('iphm.sub', [])
    .controller('SubCtrl', SubCtrl);

SubCtrl.$inject = ['$rootScope'];

function SubCtrl($rootScope) {
    $rootScope.tagline = 'Now using sub-controller.';
}
