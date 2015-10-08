var mongoose = require('mongoose'),
    async = require('async'),
    express = require('express'),
    request = require('request'),
    memorizer = require('./modules/memorizer'),
    ProgressBar = require('progress'),
    db = mongoose.connect('mongodb://localhost/memorizer');

var app = express();

memorizer();