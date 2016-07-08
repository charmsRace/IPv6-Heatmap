var angular = require('angular');

require('./vendor/angular-route/angular-route.js');
require('./js/factory');
require('./js/controllers');
require('./js/ip.service.js');
require('./js/main.ctrl.js');
require('./js/sub.ctrl.js');
require('./js/routes.js');

angular
    .module('iphm', [
        'ngRoute',
        'iphm.routes',
        'iphm.main',
        'iphm.sub',
        'iphm.api'
    ]);
