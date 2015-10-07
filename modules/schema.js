var mongoose = require('mongoose');
var UserSchema = mongoose.Schema({
    uid: Number,
    first_name: String,
    last_name: String,
    sex: Number
});

var User = mongoose.model('User', UserSchema);

module.exports = User;