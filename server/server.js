(function() {
    'use strict';
    
    var express = require('express');
    var path = require('path');
    var morgan = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var ejs = require('ejs');
    var mongoose = require('mongoose');
    
    var db = require('./config/db.js');
    mongoose.connect(db.uri);
    
    var port = process.env.PORT || 3000;
    
    var iphm = express();
    
    // view engine setup
    iphm.set('views', path.join(__dirname, 'views'));
    iphm.engine('html', ejs.renderFile);
    iphm.set('view engine', 'html');
    iphm.use(morgan('dev'));
    iphm.use(bodyParser.json());
    iphm.use(bodyParser.urlencoded({extended: true}));
    iphm.use(cookieParser());
    iphm.use(express.static(path.join(__dirname, '../client')));
    
    require('./routes/index.js')(iphm);
    iphm.set('port', port);
    
    var server = iphm.listen(iphm.get('port'), function() {
        console.log('Express server listening on port ' + server.address().port);
    });
    
    module.exports = iphm;
}());
