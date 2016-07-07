var mongoose = require('mongoose');

module.exports = mongoose.model('IPv6', {
    name: {
        type: String,
        default: ''
    }
});
