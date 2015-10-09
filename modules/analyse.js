var mongoose = require('mongoose'),
    async = require('async'),
    express = require('express'),
    request = require('request'),
    User = require('./schema');

var db = mongoose.connect('mongodb://localhost/memorizer');

var query = [
    {
        $group: {
            _id: {
                first_name: "$first_name",
                sex: "$sex"
            },
            count: {
                "$sum": 1
            },
            sexValue: {
                "$min": "$sex"
            }
        }
    },
    {
        $sort: {
            count: 1
        }
    },
    {
        $match: {
            count: {
                $gte: 10000
            }
        }
    }];

User.aggregate(query, function (err, response) {
    var names = {};

    for (var i = 0, l = response.length; i < l; i++) {
        var item = response[i],
            name = item['_id']['first_name'].toString();

        if (/([\w]+|(чка|тка|ёга|ёжа|мка|ька|шка|юша|нка|етик|ххх)$)/i.test(name))
            continue;

        if (!names[name]) {
            names[name] = [];
        }

        names[name].push(item['sexValue']);
    }

    console.log(names);
});