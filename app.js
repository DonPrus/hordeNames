var mongoose = require('mongoose'),
    memorizer = require('./modules/memorizer'),
    db = mongoose.connect('mongodb://localhost/memorizer');

function randomInteger(min, max) {
    var rand = min + Math.random() * (max - min);
    rand = Math.round(rand);
    return rand;
}

const delta = randomInteger(300,1000)*3;
const requestArguments = Math.round(delta/3);

memorizer(delta , requestArguments);