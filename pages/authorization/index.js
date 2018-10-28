//index.js
import Auth                     from '../../plugins/auth.plugin'
import Router                   from '../../plugins/router.plugin'
import Http                     from '../../plugins/http.plugin'
import Toast                    from '../../plugins/toast.plugin'

//获取应用实例
const app = getApp();



Page({
    // 授权并登录
    bindGetUserInfo (e){
        let { userInfo } = e.detail;
        if (!userInfo) return;
        this.userLogin(e.detail);
    },
    // 用户登录
    userLogin (_userinfo) {
        Auth.login().then((result) => {
            let options = {
                url: 'https://werun.renlai.fun/wechat/red/user_login',
                data: {
                    code: result,
                    rawData:_userinfo.rawData,
                    signature:_userinfo.signature,
                    encryptedData:_userinfo.encryptedData,
                    iv:_userinfo.iv
                },
                loading: true,
                auth: false
            };
            return Http(options);
        }).then((result) => {
            return Auth.updateToken(result.data.data);
        }).then((result) => {
            if(result.isCardCode == 0){
                if(result.groupOpenId){
                    return wx.navigateTo({url: "/pages/index/index?openId="+result.groupOpenId});
                    app.globalData.reurl = "/pages/index/index?openId="+result.groupOpenId;
                }
                if(app.globalData.reurl){
                    return wx.navigateTo({url: "/"+app.globalData.reurl});
                }else{
                    return Router.push('home_index');
                    //return wx.navigateTo({url: '/pages/store/store'});
                }
            }else{
                return Router.push('card_index');
            }
        }).catch((err) => {
            Toast.error(err);
        })
    },
});
