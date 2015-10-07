var mongoose = require('mongoose'),
    async = require('async'),
    express = require('express'),
    request = require('request'),
    UserSchema = require('./schema');

var memorizer = function () {
    async.waterfall(
        [
            function (callBack) {
                UserSchema.findOne({$query: {}, $orderby: {uid: -1}}, function (error, response) {
                    if (error)
                        throw new Error(error);
                    callBack(null, response);
                });
            },
            function (result, callback) {
                var startUid = result.uid + 1;
                var deltaUid = 10000;
                for (var uid = startUid, length = startUid + deltaUid, counter = 1, success = 0; uid < length; uid++) {
                    //TODO : user_ids = 1,2,3,4,5,6 ...
                    //TODO : http://vk.com/dev/execute
                    request('https://api.vk.com/method/users.get?user_ids=' + uid + '&fields=sex', function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var item = JSON.parse(body).response[0];
                            counter++;

                            if (!item['sex']) {
                                console.log('PIDOR NO SEX!');
                                return;
                            }
                            var model = new UserSchema();
                            model['uid'] = item['uid'];
                            model['first_name'] = item['first_name'];
                            model['last_name'] = item['last_name'];
                            model['sex'] = item['sex'];
                            model.save();
                            success++;
                            console.log(item['uid']);
                            if (counter == deltaUid) {
                                callback(null, success);
                            }
                        }
                    });
                }
            }
        ], function (err, result) {
            if (err) {
                console.log(err);
            }
            console.log('Total number: ' + result);
            process.exit();
        });
};

module.exports = memorizer;
