var mongoose = require('mongoose'),
    async = require('async'),
    express = require('express'),
    request = require('request'),
    ProgressBar = require('progress'),
    UserSchema = require('./schema');

var memorizer = function (delta, requestArguments) {
    var numbers = delta / requestArguments,
        green = '\u001b[42m \u001b[0m',
        red = '\u001b[41m \u001b[0m';
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
                    endUid,
                    arr = [],
                    countId,
                    temp = [];
                console.log('Starting with : ' + startedUid);
                for (var i = 0; i < numbers; i++) {
                    countId = 0;
                    endUid = startedUid + requestArguments;
                    for (var j = startedUid; j < endUid; j++) {
                        temp.push(j);
                        countId++;
                    }
                    startedUid += countId;
                    arr.push(temp.join());
                    temp = [];
                }
                callback(null, arr);
            },
            function (result, callback) {
                var successUsers = 0,
                    saveList = [],
                    bar = new ProgressBar('Parsing :current/:total [:bar] :etas', {
                        total: delta,
                        complete: green,
                        incomplete: red
                    });
                //TODO : http://vk.com/dev/execute;
                //TODO : add 8 workers;
                for (var i = 0; i < numbers; i++) {
                    request('https://api.vk.com/method/users.get?user_ids=' + result[i] + '&fields=sex', function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                var usersResponse = JSON.parse(body).response;
                                for (var j = 0, usersLength = usersResponse.length; j < usersLength; j++) {
                                    bar.tick();
                                    var item = usersResponse[j];
                                    if (!item['sex']) {
                                        continue;
                                    }
                                    var model = new UserSchema();
                                    model['uid'] = item['uid'];
                                    model['first_name'] = item['first_name'];
                                    model['last_name'] = item['last_name'];
                                    model['sex'] = item['sex'];
                                    saveList.push(model);
                                    successUsers++;
                                }
                                if (bar.complete) {
                                    callback(null, successUsers, saveList);
                                }
                            } else {
                                callback(error, successUsers, saveList);
                            }
                        }
                    );
                }
            }
        ], function (err, result, list) {
            if (err || !result) {
                console.log('Retry');
                close();
            }
            UserSchema.create(list, function (r, c) {
                console.log('Total added uids: ' + result);
                close();
            });
            function close() {
                process.exit();
            }
        });
};

module.exports = memorizer;
