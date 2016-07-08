'use strict';

var mongoose = require('mongoose');

var IPv6Schema = new mongoose.Schema({
    name: {
        type: String,
        default: ''
    }
});

IPv6Schema.methods = {};

module.exports = mongoose.model('IPv6', IPv6Schema);
