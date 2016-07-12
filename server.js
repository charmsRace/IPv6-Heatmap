(function() {
    'use strict';
    
    require('dotenv').config();
    
    var express = require('express');
    var path = require('path');
    var fs = require('fs');
    var morgan = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var ejs = require('ejs');
    var mongoose = require('mongoose');
    var http = require('http');
    
    var dbcf = require('./server/methods/dbcf.js');
    var dburi = process.env.MONGODB_URI || dbcf.localUri;
    //var dburi = 'mongodb://localhost/development';
    
    var modelDir = path.join(__dirname, 'server/models');
    
    var port = process.env.PORT || 3000;
    
    var iphm = express();
    
    // view engine setup
    iphm.set('views', path.join(__dirname, 'views'));
    iphm.engine('html', ejs.renderFile);
    //iphm.set('view engine', 'html');
    iphm.use(morgan('dev'));
    iphm.use(bodyParser.json());
    iphm.use(bodyParser.urlencoded({extended: true}));
    iphm.use(cookieParser());
    
    var loggingRouter = require('./server/routers/logging.js');
    var rawRouter = require('./server/routers/raw.js');
    var apiRouter = require('./server/routers/api.js');
    var siteRouter = require('./server/routers/site.js');
    var staticRouter = require('./server/routers/static.js');
    var fallbackRouter = require('./server/routers/fallback.js');
    
    iphm.use(loggingRouter);
    iphm.use('/raw', rawRouter)
    iphm.use('/api/v0.1', apiRouter)
    iphm.use('/', siteRouter)
    iphm.use('/', staticRouter)
    iphm.use(fallbackRouter);
    
    iphm.set('port', port);
    var server = http.createServer(iphm);
    
    console.log('start');
    fs
        .readdirSync(modelDir)
        .filter(function(file) {
            return ~file.search(/^[^\.].*\.js$/);
        })
        .forEach(function(file) {
            require(path.join(modelDir, file));
        });
    var listen = function() {
        iphm.listen(iphm.get('port'), function() {
            console.log('Express server listening on port ' + iphm.get('port'));
        });
    };
    
    var connect = function {
        var options = {};
        return mongoose
            .connect(dburi, options)
            .connection;
    };
    
    connect()
        .on('error', console.log)
        .on('disconnected', connect)
        .once('open', listen);
    
    module.exports = iphm;
}());
