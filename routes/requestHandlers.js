var fs =require('fs');
var Hapi = require('hapi');
var AWS = require('aws-sdk');
var INDEX_KEY = 'indexOfGrades';
var numOfFilesInBucket;
var BUCKET_NAME = 'israelsbucket';

AWS.config.loadFromPath('./aws_config.json');
var s3 = new AWS.S3();
var server = new Hapi.Server();
server.connection({port: 8888});


    function calculate(reply, cache) {
        var count = 0;
        var allData = "";
        var params2 = {Bucket: BUCKET_NAME};

        s3.listObjects(params2, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                numOfFilesInBucket = data.Contents.length;
                data.Contents.forEach(function (content) {
                    var fileName = content.Key;
                    var paramsForFileByKey = {Bucket: BUCKET_NAME, Key: fileName};
                    s3.getObject(paramsForFileByKey, function (err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else {
                            var fileContent = data.Body.toString();
                            var avGrades = averageGrades(fileContent);
                            allData = allData + '<br>' + "For File " + fileName + " the average grade is " + avGrades + '<br>';

                            count++;
                            if (count == numOfFilesInBucket) {
                                cache.setObject(INDEX_KEY, allData).then(function () {
                                    reply('<br>' + "-------the calculation succeeded-------" + '<br>' + allData);
                                });
                            }
                        }
                    });
                });
            }
        });
    }


    function upload(request, reply) {

        var data = request.payload;
        if (data.upload) {
            var fileName = data.upload.hapi.filename;

            uploadFile(data.upload._data, fileName, fileName);

            var ret = {
                filename: data.upload.hapi.filename,
                headers: data.upload.hapi.headers
            }

            reply(JSON.stringify(ret));
        }
    }

    function clearCache(cache, index_key, reply) {
//check if i need to delete all the cache and not just by key word
        cache.delObject(index_key);
        reply("The cache was deleted!!!!");
    }

    function getDataFromCache(cache, index_key, reply) {

        cache.getObject(index_key).then(function (cacheValue) {
            if (cacheValue) {
                reply("-------Results from cache-------" + '<br>' + cacheValue);
            } else {
                reply("The cache is empty! ");
            }
        });
    }

    function averageGrades(fileContent) {

        var sum = 0;
        var grades = JSON.parse(fileContent).Grades;
        grades.forEach(function (grade) {
            for (var key in grade) {
                sum += grade[key];
            }
        });
        return sum / grades.length;
    }

    function uploadFile(fileBuffer, remoteFilename, fileName) {

        var metaData = getContentTypeByFile(fileName);
        s3.putObject({
            ACL: 'public-read',
            Bucket: BUCKET_NAME,
            Key: remoteFilename,
            Body: fileBuffer,
            ContentType: metaData
        }, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
    }

    function getContentTypeByFile(fileName) {

        var rc = 'application/octet-stream';
        var fn = fileName.toLowerCase();

        if (fn.indexOf('.txt') >= 0) rc = 'text/html';
        else if (fn.indexOf('.html') >= 0) rc = 'text/html';
        else if (fn.indexOf('.css') >= 0) rc = 'text/css';
        else if (fn.indexOf('.json') >= 0) rc = 'application/json';
        else if (fn.indexOf('.js') >= 0) rc = 'application/x-javascript';
        else if (fn.indexOf('.png') >= 0) rc = 'image/png';
        else if (fn.indexOf('.jpg') >= 0) rc = 'image/jpg';

        return rc;
    }

    exports.calculate = calculate;
    exports.upload = upload;
    exports.clearCache = clearCache;
    exports.getDataFromCache = getDataFromCache;




