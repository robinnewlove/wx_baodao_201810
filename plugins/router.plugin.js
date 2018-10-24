
import RouterConfig from '../config/router.config'

export default {

    push: (url, params = {}, type = false) => new Promise((resolve, reject) => {
        let key = type ? 'redirectTo' : 'navigateTo';
        handle(url, params, key, resolve, reject)
    }),

    root: (url, params = {}, type = false) => new Promise((resolve, reject) => {
        let key = type ? 'reLaunch' : 'switchTab';
        handle(url, params, key, resolve, reject)
    }),

    pop(delta) {
        wx.navigateBack({delta});
    },

    getParams (options) {
        if(!options) return {};
        let {params} = options;
        if(!params) return {};
        return JSON.parse(decodeURIComponent(options.params));
    }
};

function handle(url, params, key, resolve, reject) {
    url = RouterConfig[url] || '';
    if(key !== 'switchTab') url = `${url}?params=${encodeURIComponent(JSON.stringify(params))}`;
    if (!url) return reject('未找到对应页面');
    wx[key]({
        url,
        success: (e) => {
            resolve(e);
        },
        fail: (e) => {
            reject(e);
        },
    });
}
