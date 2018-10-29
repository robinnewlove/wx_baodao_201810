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
        code:"",
        base64:""
    },
    onLoad:function () {
        let that = this;
    },

    onShow () {
        Auth.getToken().then((info) => {
            this.showCard(info);
        }).catch(() => {
            Router.push('authorization_index');
        });
    },

    showCard:function (info) {

        let { openId } = info;

        let options = {
            url: 'https://werun.renlai.fun/wechat/red/get_card_qrcode',
            data:{
                openId:openId
            }
        };
        return Http(options).then((result) => {
            //console.log(result.data.data.list.length)
            if(result.data.errcode == 0){
                this.setData({
                    code:result.data.data.code,
                    base64:result.data.data.base64
                })
            }else{
                Toast.error(result.data.errmsg);
            }

            //if(result.data.data.list.length)
        });
    }
})