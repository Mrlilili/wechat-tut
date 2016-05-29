var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
    access_token: prefix + 'token?grant_type=client_credential'
}

function Wechat(opts) {
    var that = this;
    this.appID = opts.appID;
    this.appsecret = opts.appsecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.access_token = null;
    this.expires_in = null;
    this.getAccessToken()
        .then(function (data) {
            try {
                //console.log('try');
                data = JSON.parse(data)
            }
            catch (e) {
                //console.log('catch');
                return that.updateAccessToken();
            }

            if (that.isValidAccessToken(data)) {

                return Promise.resolve(data);
            }
            else {
                //console.log('is false');
                return that.updateAccessToken();
            }
        })
        .then(function (data) {
            //console.log('resData:', data);
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;
            that.saveAccessToken(data);
        })
}
module.exports = Wechat;

Wechat.prototype.isValidAccessToken = function (data) {
    //console.log('isvali:', data);
    if (!data || !data.access_token || !data.expires_in) {
        //console.log('re false');
        return false;
    }
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());
    //console.log('now:', now);
    //console.log('ex:', expires_in);
    if (expires_in > now) {
        //console.log('re true');
        return true;
    } else {
        //console.log('re falset');
        return false;
    }
}

Wechat.prototype.updateAccessToken = function () {
    var appID = this.appID;
    var appsecret = this.appsecret;
    var url = api.access_token + '&appid=' + appID + '&secret=' + appsecret;
    return new Promise(function (resolve, reject) {
        request({url: url, json: true}).then(function (response) {
            var data = response.body;
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;
            data.expires_in = expires_in;
            resolve(data);

        })

    })
}
