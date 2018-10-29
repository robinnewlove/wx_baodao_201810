//index.js
import Auth                     from '../../plugins/auth.plugin'
import Router                   from '../../plugins/router.plugin'
import Http                     from '../../plugins/http.plugin'
import Toast                    from '../../plugins/toast.plugin'



//获取应用实例
const app = getApp();
const stringUtil = require('../../utils/stringUtil.js');


Page({
    data:{
        storedata:[],
        testname:"1234567890"
    },
    onLoad:function () {
        let that = this;
    },

    onShow () {
        Auth.getToken().then((info) => {
            this.showStore(info);
        }).catch(() => {
            Router.push('authorization_index');
        });
    },

    showStore:function () {
        let options = {
            url: 'https://werun.renlai.fun/wechat/red/get_store_list'
        };
        return Http(options).then((result) => {
            //console.log(result.data.data.list.length)
            this.setData({
                selectdata:result.data.data.list
            })
            //if(result.data.data.list.length)
        });
    }
})