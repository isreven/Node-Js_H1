module.exports = function () {
    var Promise = require('bluebird');
    var client;
    function setup() {
        var redis = require("redis");
         client = redis.createClient(6379, '52.28.60.14', {});
        Promise.promisifyAll(client);
    }


    function getObject(key){
        var x = client.getAsync(key);
   return x;
    }

    function setObject(key, value){
        return client.setAsync(key, value);
    }


    function delObject(key){
        return client.del(key);
    }

    return {
        setup : setup,
        getObject : getObject,
        setObject : setObject,
        delObject : delObject
    };

}