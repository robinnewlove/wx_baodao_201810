
export default {
    error (err) {
        if (typeof err === 'undefined') return;
        let msg = '';
        if (typeof err === 'object') {
            msg = err.errMsg || err.Message || JSON.stringify(err);
        } else {
            msg = err;
        }
        wx.showToast({
            title: msg,
            icon: 'none',
            duration: 3000
        })
    },
    confirm: (options = {}) => new Promise((resolve, reject) => {
        wx.showModal({
            title: '温馨提示',
            ...options,
            success: res=>{
                resolve(res);
            },
            fail: err => {
                reject(err);
            },
        });
    })
}
