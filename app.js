var mongoose = require('mongoose'),
    memorizer = require('./modules/memorizer'),
    db = mongoose.connect('mongodb://localhost/memorizer');

const delta = 100;

memorizer(delta);