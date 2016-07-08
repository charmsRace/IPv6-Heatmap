angular
    .module('iphm.api', [])
    .constant('ENDPOINT_URI', 'http://localhost:3000/api/')
    .service('ipApi', ipApi);

ipApi.$inject = [
    '$http',
    'ENDPOINT_URI'
];

function ipApi($http, ENDPOINT_URI) {
    var service = this;
    var path = 'ipv6/';
    
    var getUrl = function() {
        return ENDPOINT_URI + path;
    };
    
    var getUrlForId = function(id) {
        return getUrl() + id;
    };
    
    service.fetchAll = function() {
        return $http.get(getUrl());
    };
    
    service.fetchOne = function(id) {
        return $http.get(getUrlForId(id));
    };
}
