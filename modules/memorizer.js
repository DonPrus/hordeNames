var mongoose = require('mongoose'),
    async = require('async'),
    express = require('express'),
    request = require('request'),
    ProgressBar = require('progress'),
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
                var startWithUid = result.uid + 1;
                var deltaUid = 1000;
                console.log('Start with: ' + startWithUid + '\nWill check ' + deltaUid + '\n');
                var bar = new ProgressBar(':bar', {
                    total: deltaUid
                });
                for (var uid = startWithUid, length = startWithUid + deltaUid, successUsers = 0; uid < length; uid++) {
                    //TODO : user_ids = 1,2,3,4,5,6 ...;
                    //TODO : http://vk.com/dev/execute;
                    //TODO : add 8 workers;
                    request('https://api.vk.com/method/users.get?user_ids=' + uid + '&fields=sex', function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var item = JSON.parse(body).response[0];
                            bar.tick();
                            if (!item['sex']) {
                                return;
                            }
                            var model = new UserSchema();
                            model['uid'] = item['uid'];
                            model['first_name'] = item['first_name'];
                            model['last_name'] = item['last_name'];
                            model['sex'] = item['sex'];
                            model.save();
                            successUsers++;

                            if (bar.complete) {
                                callback(null, successUsers);
                            }
                        }
                    });
                }
            }
        ], function (err, result) {
            if (err) {
                console.log(err);
            }
            console.log('Total added uids: ' + result);
            process.exit();
        });
};

module.exports = memorizer;
