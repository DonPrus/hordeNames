var mongoose = require('mongoose'),
    async = require('async'),
    express = require('express'),
    request = require('request'),
    db = mongoose.connect('mongodb://localhost/memorizer');

var app = express();
var UserSchema = mongoose.Schema({
    uid: Number,
    first_name: String,
    last_name: String,
    sex: Number
});
var User = mongoose.model('User', UserSchema);

async.waterfall([function (callBack) {
    User.findOne({$query: {}, $orderby: {uid: -1}}, function (error, response) {
        if (error)
            throw new Error(error);
        callBack(null, response);
    });
}], function (error, result) {
    var startUid = result.uid + 1;
    for (var uid = startUid, length = startUid + 1000; uid < length; uid++) {
        request('https://api.vk.com/method/users.get?user_ids=' + uid + '&fields=sex', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var item = JSON.parse(body).response[0];

                if (!item['sex']) {
                    console.log('PIDOR NO SEX!');
                    return;
                }
                console.log(item['uid']);
                var model = new User();
                model['uid'] = item['uid'];
                model['first_name'] = item['first_name'];
                model['last_name'] = item['last_name'];
                model['sex'] = item['sex'];
                model.save();
            }
        });
    }
});