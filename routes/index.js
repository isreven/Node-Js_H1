var Hapi = require('hapi');
var cache = require('./cacheLayer')();
var requestHandler = require('./requestHandlers');
var server = new Hapi.Server();
var INDEX_KEY = 'indexOfGrades';
server.connection({ port: 8888 });

server.route({
    method: 'GET',
    path: '/calculate',
    handler: function (request, reply) {
        requestHandler.calculate(reply,cache);
    }
});

server.route({
    method: 'POST',
    path: '/upload',
    config: {

        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data'
        },
        handler: function (request, reply) {
            requestHandler.upload(request,reply);
        }
    }
});

server.route({
    method: 'GET',
    path: '/getDataFromCache',
    handler: function (request, reply) {
        requestHandler.getDataFromCache(cache,INDEX_KEY,reply);
    }
});

server.route({
    method: 'GET',
    path: '/clearCache',
    handler: function (request, reply) {
        requestHandler.clearCache(cache,INDEX_KEY,reply);
    }
});


server.start(function () {
    console.log("ds");
    cache.setup();
    console.log('Server running at:', server.info.uri);
});