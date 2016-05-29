'use strict'
var Koa = require('koa');
var path = require('path');
var wechat = require('./wechat/g');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var util = require('./lib/util');
var app = new Koa();
var config = {
    wechat: {
        appID: 'wx1c32efeac589a531',
        appsecret: 'a6c956106157103a4c254338a4594593',
        token: 'liyan',
        getAccessToken: function () {
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function (data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data);
        }
    }
}

app.use(wechat(config.wechat));

app.listen(3030);

console.log('监听:3030接口');