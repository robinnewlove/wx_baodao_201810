
//import EnvConfig                from 'config/env.config'
import Toast                    from 'toast.plugin'
import Auth                     from 'auth.plugin'
import Router                   from 'router.plugin'

const DEFAULT = {
    method: 'POST',
    useOpenId: true,
    data: {},
    auth: true,
};

Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    return this.then(
        value => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason })
    );
};


class Http {
    constructor (opt) {
        let options = Object.assign({}, DEFAULT, opt);

        this.method = options.method.toLocaleUpperCase();

        this.data = options.data;
        this.useOpenId = options.useOpenId;
        this.auth = options.auth;
        this.url = options.url;

        return this._fetch();
    }

    _fetch () {
        return new Promise((resolve, reject) => {

            Auth.getToken().then((res) => {
                let {
                    token,
                    openId
                } = res;


                //this.useOpenId && (this.data.OpenId = openId);
                var timestamp = Date.parse(new Date());
                this.url = `${this.url}?token=${token}&&t=${timestamp}`
            }).catch(() => {}).finally(() => {
                wx.request({
                    url: this.url,
                    data: this.data,
                    method: this.method,
                    success:function (res){
                        //console.log("登录返回接口1："+res.data.errcode);
                        resolve(res)
                    }
                });
            });



        });
    }

    _log (str, data) {
        console.log(`${this.url} ${str} => `, data)
    }
};




export default (options = {}) => {
    let { loading, navLoading } = options;
    if (typeof loading === 'undefined' || loading) wx.showLoading({title: '加载中'});
    if (typeof navLoading === 'undefined' || navLoading) wx.showNavigationBarLoading();
    return new Http(options).finally(() => {
        if (typeof loading === 'undefined' || loading) wx.hideLoading();
        if (typeof navLoading === 'undefined' || navLoading) wx.hideNavigationBarLoading();
    })
}
