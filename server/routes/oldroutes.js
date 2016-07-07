(function() {
    'use strict';
    
    var express = require('express');
    var router = express.Router();
    var mongojs = require('mongojs');
    var db = mongojs('IPv6_Heatmap', ['ipData']);
    
    router.get('/', function(req, res) {
        res.render('index');
    });
    
    router.get('/api/todos', function(req, res) {
        db.ipData.find(function(err, data) {
            res.json(data);
        });
    });
    
    router.post('/api/todos', function(req, res) {
        db.ipData.insert(req.body, function(err, data) {
            res.json(data);
        });
    });
    
    router.put('/api/todos', function(req, res) {
        db.ipData.update({
            _id: mongojs.ObjectId(req.body._id)
        }, {
            isCompleted: req.body.isCompleted,
            ipDatum: req.body.todo
        }, {}, function(err, data) {
            res.json(data);
        });
    });
    
    router.delete('/api/todos/:_id', function(req, res) {
        db.ipData.remove({
            _id: mongojs.ObjectId(req.params._id)
        }, '', function(err, data) {
            res.json(data);
        });
    });
    
    module.exports = router;
}());


