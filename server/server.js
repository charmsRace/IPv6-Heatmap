(function() {
    'use strict';
    
    require('dotenv').config();
    
    var express = require('express');
    var path = require('path');
    var morgan = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var ejs = require('ejs');
    var mongoose = require('mongoose');
    var http = require('http');
        
    var dbcf = require('./methods/dbcf.js');
    
    var dburi = process.env.MONGOLAB_URI || dbcf.localUri;
    
    mongoose.connect(dburi);
    
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
    iphm.use(express.static(path.join(__dirname, '../client/www')));
    
    var siteRouter = require('./routes/site.js');
    var apiRouter = require('./routes/api.js');
    //siteRouter.use('/api', apiRouter);
    iphm.use('/api', apiRouter);
    iphm.use('/', siteRouter);
    
    var server = http.createServer(iphm);
    iphm.set('port', port);
    iphm.listen(iphm.get('port'), function() {
        console.log('Express server listening on port ' + iphm.get('port'));
    });
    
    module.exports = iphm;
}());
