angular
    .module('iphm.routes', [])
    .config(routeConfig);

routeConfig.$inject = [
    '$routeProvider',
    '$locationProvider'
];

function routeConfig($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/views/home.html',
            controller: 'MainCtrl'
        })
        .when('/v1', {
            templateUrl: '/views/v1.html',
            controller: 'SubCtrl'
        })
        .when('/v2', {
            templateUrl: '/views/v2.html',
            controller: 'SubCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
    $locationProvider.html5Mode(true);
}
