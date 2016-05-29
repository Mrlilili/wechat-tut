var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./Wechat');
var util = require('./util');

module.exports = function (opts) {

    return function *(next) {
        var wechat = new Wechat(opts);
        console.log(this.query);
        var that = this;
        var token = opts.token;
        var signature = this.query.signature;
        var echostr = this.query.echostr;
        var timestamp = this.query.timestamp;
        var nonce = this.query.nonce;
        var str = [token, timestamp, nonce].sort().join('');
        var sha = sha1(str);
        if (this.method === 'GET') {
            if (sha === signature) {
                this.body = echostr + '';
            } else {
                this.body = 'wrong'
            }
        } else if (this.method === 'POST') {
            if (sha !== signature) {
                this.body = 'wrong';
                return false;
            }
            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            });
            var content = yield util.parseXMLAsync(data.toString());
            var message = util.formatMessage(content.xml);
            console.log(message);
            if (message.MsgType === 'event') {
                if (message.Event === 'subscribe') {
                    var now = new Date().getTime();
                    that.status = 200;
                    that.type = 'application/xml'
                    that.body = '<xml>'
                        + '<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>'
                        + '<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>'
                        + '<CreateTime>' + now + '</CreateTime>'
                        + '<MsgType><![CDATA[text]]></MsgType>'
                        + '<Content><![CDATA[谢谢,亲爱的美美红关注了我,么么哒]]></Content>'
                        + '</xml>'
                    console.log(that.body);
                    return

                }
            }

        }

    }
}
