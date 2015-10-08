var mongoose = require('mongoose'),
    async = require('async'),
    express = require('express'),
    request = require('request'),
    ProgressBar = require('progress'),
    UserSchema = require('./schema');

var memorizer = function (delta) {
    var deltaUid = delta;
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
                var startedUid = result.uid + 1,
                    endUid = startedUid + deltaUid,
                    arr,
                    temp = [];
                console.log(startedUid);
                for (var i = startedUid; i < endUid; i++) {
                    temp.push(i);
                }
                arr = temp.join();
                callback(null, arr);
            },
            function (result, callback) {
                var successUsers = 0;
                var bar = new ProgressBar(':bar', {
                    total: deltaUid
                });
                //TODO : user_ids = 1,2,3,4,5,6 ...;
                //TODO : http://vk.com/dev/execute;
                //TODO : add 8 workers;
                request('https://api.vk.com/method/users.get?user_ids=' + result + '&fields=sex', function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var usersResponse = JSON.parse(body).response;
                            var saveList = [];
                            for (var i = 0, usersLength = usersResponse.length; i < usersLength; i++) {
                                var item = usersResponse[i];
                                bar.tick();
                                if (!item['sex']) {
                                    continue;
                                }
                                var model = new UserSchema();
                                model['uid'] = item['uid'];
                                model['first_name'] = item['first_name'];
                                model['last_name'] = item['last_name'];
                                model['sex'] = item['sex'];
                                //model.save();
                                saveList.push(model);
                                successUsers++;

                                if (bar.complete) {
                                    callback(null, successUsers,saveList);
                                }
                            }
                        }
                    }
                );
            }
        ], function (err, result, list) {
            if (err) {
                console.log(err);
            }
            UserSchema.create(list,function(r,c){
                console.log('Total added uids: ' + result);
                close();
            });
            function close() {
                process.exit();
            }

        });
};

module.exports = memorizer;
