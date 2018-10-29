//index.js
import Auth                     from '../../plugins/auth.plugin'
import Router                   from '../../plugins/router.plugin'
import Http                     from '../../plugins/http.plugin'
import Toast                    from '../../plugins/toast.plugin'

//获取应用实例
const app = getApp();
const avatarStrokeWidth = 0;
const stringUtil = require('../../utils/stringUtil.js');
const Tool = require('../../utils/tools.js');

Page({
  data: {

    maskboxshow:"",
    showimgbox:false,
    btnHelp:false,
    btnMystart:false,
    btnShare:false,
    rulebox:false,
    maskbox:false,
    btnReplay:false,
    btnReplayTa:false,
    btnGetCode:false,
    allwin:0,
    userList:[],
    tuanNum:0,
    listNum:0,
    status:"20006",
    submitbox:false,
    valTel:"",
    valVcode:"",
    vcode:"----",
      clock:"00:00:00",

    //画布相关字段
    canvasHeight:"0",
    canvasWidth:"0",
    avatar:'',
    bgImage: ['http://www.zhenzhezixun.com/images/sharebg.jpg'],
    qurl:"",
    imgload:0,
    bgImagePath:"",
    avatarPath:"",
    qurlPath:"",
    targetSharePath: null,
    avatarWidth:'0',
    avatarLeft:"",
    avatarTop:"",
    nickName:"亲爱的用户",
    nickNameTop:"",
    nickNameLeft:"",
    qcodeTop:"",
    qcodeWidth:0,
    openId:null,
    urlopenId:null,
    visitOpenid:"",

      //弹出层
      tiptxt:"",
      tipshow:false

  },
  onLoad: function (e) {
      //console.log("eeeeeeeee:"+e);
      //console.log(Tool.getCurrentPageUrlWithArgs());
    wx.canIUse('wx.showShareMenu');

    let that = this;

        wx.getSystemInfo({
      success: function (res) {
        //console.log(res.windowWidth)
        //根据图片算图片矩形的宽高
        var scaleNum = res.windowWidth*0.7/750;
        that.setData({
          canvasWidth:res.windowWidth*0.7,
          canvasHeight:scaleNum*1334,
          avatarWidth:scaleNum*56,
          avatarTop:scaleNum*33,
          avatarLeft:scaleNum*32,
          nickNameTop:scaleNum*49,
          nickNameLeft:scaleNum*109,
          qcodeTop:scaleNum*848,
          qcodeWidth:scaleNum*300*0.8
        })


        //console.log("qcodeWidth:"+that.data.qcodeWidth)
      },
    }),
        wx.showShareMenu({
          withShareTicket: true
        });

    let _openid;
    console.log("e.scene:"+e.scene);
    if(e.scene){
      //&是我们定义的参数链接方式
      var scene = decodeURIComponent(e.scene)
      _openid = scene;
      //其他逻辑处理。。。。。
    }else{
      _openid = e.openId;
    }

    console.log("_openid:"+_openid);
    if(_openid){
      that.setData({
        urlopenId:_openid,
        openId: _openid,
        btnHelp:true
      });
    }

  },
  // 生命周期回调—监听页面显示
  onShow () {
      console.log('进入页面开始')
    Auth.getToken().then((info) => {
        console.log('授权成功');
        console.log(info);
      this.firFun(info);
      this.getAllwin();
      //console.log("getToken:"+info);
    }).catch(() => {
        app.globalData.reurl = Tool.getCurrentPageUrlWithArgs();
        console.log(app.globalData.reurl);
        Router.push('authorization_index');
    });
  },

  firFun:function (info) {

    let { openId } = info;

    this.setData({
      visitOpenid: openId
    });

      this.getUserqrcode();

    if(this.data.openId){
        if(this.data.openId == openId){
          this.setData({
            btnHelp:false,
            btnShare:true
          });
        }
    }else{
      this.setData({
        openId: openId
      });
    }

    let options = {
      url: 'https://werun.renlai.fun/wechat/red/user_setup',
      data:{
        openId:this.data.openId
      }
    };
    return Http(options).then((result) => {

      this.getClock(result.data.data.timestamp*1000);
      //this.getClock(10000);
      //console.log(result.data.data.timestamp)
      if(this.data.visitOpenid == this.data.openId){
        //用户自己访问自己的主页
        if(result.data.errcode == 20006 || result.data.errcode == 0){
          //进行中
          this.setData({
            btnShare:true,
              status:"20006"
          })
        }else if(result.data.errcode == 20003){
          //失败 显示再来一次
          this.setData({
            btnReplay:true
          })
        }else if(result.data.errcode == 20005){
          //成功
          this.setData({
            btnGetCode:true,
              status:"20005"
          })
        }
      }else{
        //用户访问TA的主页
        if(result.data.errcode == 20006 || result.data.errcode == 0 ){
          //进行中  判断 是否助力过
            console.log(this.data.visitOpenid)
            console.log(result.data.data.userList)

            var inArray = function(arr, item) {
                for(var i = 0; i < arr.length; i++) {
                    if(arr[i].openId == item) {
                        return true;
                    }
                }
                return false;
            };
            console.log("this.data.visitOpenid:"+ this.data.visitOpenid)

          if (inArray(result.data.data.userList,this.data.visitOpenid)){                 //判断age是否存在于obj里面
              console.log('助力过')
            this.setData({
              btnHelp:true,
              btnShare:true
            });
          }else{
            console.log('没有助力过')
          }
        }else if(result.data.errcode == 20003){
          //失败 显示 我也要开团
          this.setData({
            btnReplayTa:true
          })
        }else if(result.data.errcode == 20005){
          //成功
          this.setData({
            btnGetCode:true,
              status:"20005"
          })
        }
      }
      //console.log(result.data.errcode)
      this.setData({
        userList:result.data.data.userList,
        tuanNum:3-result.data.data.userList.length,
        listNum:result.data.data.userList.length
      });
    });
  },
  
  getAllwin:function () {

        let options = {
          url: 'https://werun.renlai.fun/wechat/red/get_count_coupon'
        };
    return Http(options).then((result) => {
      this.setData({
         allwin:result.data.data.count
      })
    });

  },
  
  helpGroup:function () {
    let options = {
      url: 'https://werun.renlai.fun/wechat/red/user_help',
      data:{
        openId:this.data.visitOpenid,
        fromOpenId:this.data.openId
      }
    };
    return Http(options).then((result) => {
      console.log(result.data);

        if(result.data.errcode == 20006){
            //助力成功

            this.setData({
                userList:result.data.data.userList,
                tuanNum:3-result.data.data.userList.length,
                listNum:result.data.data.userList.length
            });
            if(result.data.data.userList.length == 3){
                //满了3人处理按钮，提示语
                this.setData({
                    btnGetCode:true,
                    btnHelp:false,
                    status:"20005"
                })
            }else{
                //没满3人 处理按钮
                this.setData({
                    btnShare:true,
                    btnHelp:false
                })
            }
            //助力成功结束
        }else if(result.data.errcode == 20005){

            this.setData({
                tipshow:true,
                maskbox:true,
                tiptxt:"您已成团，不能助力；"
            })
        }

    });
  },

    ruleclose:function () {
        let that = this;
        that.setData({
            rulebox:false,
            maskbox: false
        });
    },

    ruleopen:function () {
        let that = this;
        that.setData({
            rulebox:true,
            maskbox: true
        });
    },

    getmsg:function(){
      //获取短信验证码接口
        console.log("valTel:"+this.data.valTel)
        console.log("valVcode:"+this.data.valVcode)

        //https://werun.renlai.fun/wechat/red/user_sendsms
        if(this.data.valTel&&this.data.valVcode){
            let that = this;
            let options = {
                url: 'https://werun.renlai.fun/wechat/red/user_sendsms',
                data:{
                    openId:that.data.visitOpenid,
                    verify:this.data.valVcode,
                    mobile:this.data.valTel
                }
            };
            return Http(options).then((result) => {
                if(result.data.errcode != 0){
                    Toast.error(result.data.errmsg);
                }else{
                    Toast.error("短信发送成功，请注意查收！");
                }
            })
        }else{
            Toast.error("手机号和验证码为必须的！");
        }
    },
    getVcode:function () {
        //获取验证码接口
        let that = this;
        let options = {
            url: 'https://werun.renlai.fun/wechat/red/get_verify_code',
            data:{
                openId:that.data.visitOpenid
            }
        };
        return Http(options).then((result) => {
            this.setData({
                vcode: result.data.data.code
            })
        })
    },

    formSubmit:function (e) {
       //提交领券信息
        console.log('form发生了submit事件，携带数据为：', e.detail.value)

        if(e.detail.value.telePhone != "" && e.detail.value.msg != ""){
            let that = this;
            let options = {
                url: 'https://werun.renlai.fun/wechat/red/user_coupon',
                data:{
                    openId:that.data.visitOpenid,
                    smscode:e.detail.value.msg,
                    mobile:e.detail.value.telePhone
                }
            };
            return Http(options).then((result) => {
                if(result.data.errcode == 0){
                    return Router.push('card_index');
                }else{
                    Toast.error(result.data.errmsg);
                }
            })
        }else{
            Toast.error("手机号和验证码为必须的！");
        }

    },

    btnGetCode:function () {
        //显示表单层
        let that = this;
        that.setData({
            submitbox:true,
            maskbox: true
        });
        that.getVcode();
    },
    submitclose:function () {
        //显示表单层
        let that = this;
        that.setData({
            submitbox:false,
            maskbox: false
        });
    },


    valTel: function(e){
        let that = this;
        that.setData({
            valTel:e.detail.value
        });
    },
    valVcode: function(e){
        let that = this;
        that.setData({
            valVcode:e.detail.value
        });
    },

    getClock:function (_leftTime) {
        var that=this;
        var leftTime = _leftTime;
        if(leftTime < 0){
            leftTime = 0;
        }
        this.data.intervarID= setInterval(function () {
            //计算剩余的毫秒数
                var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时
                var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟
                var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数
                hours = that.checkTime(hours);
                minutes = that.checkTime(minutes);
                seconds = that.checkTime(seconds);
                leftTime = leftTime -1000;

            //console.log(hours + ":" + minutes + ":" + seconds)
                that.setData({
                    clock: hours + ":" + minutes + ":" + seconds
                })
                if (hours == '00' && minutes == '00' && seconds=='00')
                {
                    clearInterval(that.data.intervarID);
                    if(that.data.visitOpenid == that.data.openId){
                        //主人态
                        that.setData({
                            btnHelp:false,
                            btnMystart:false,
                            btnShare:false,
                            btnReplay:true,
                            status:"0000"
                        });
                    }else{
                        that.setData({
                            btnHelp:false,
                            btnMystart:false,
                            btnShare:false,
                            btnReplayTa:true,
                            status:"0000"
                        });
                    }
                }
            }, 1000
        )
    },

    checkTime:function(i) { //将0-9的数字前面加上0，例1变为01
    if (i < 10)  {
        i = "0" + i;
    }
    return i;
    },

    replay:function () {
        return Router.push('home_index');
    },



  //分享
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      //console.log(res.target)
    }
    return {
      title: '快来跟我一起瓜分2100元万圣节礼包',
      path: '/pages/index/index?openId='+that.data.openId,
      imageUrl:'https://werun.renlai.fun/static/images/red/shareimg.jpg',
      success: function (res) {
        console.log("shareTickets:"+res)
        that.hideshare();
        // console.log
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
      }

    }
  },

  //显示分享层
  showshare:function(){


    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })

    this.animation = animation

    animation.bottom(0).step();

    this.setData({
      animationData:animation.export(),
      maskboxshow:"show"

    })
  },
  //隐藏分享层
  hideshare:function(){


    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })

    this.animation = animation

    animation.bottom("-450rpx").step();

    this.setData({
      animationData:animation.export(),
      maskboxshow:""

    })
  },

  shereImgshow:function () {
    let that = this;
    that.hideshare();
    that.setData({
      showimgbox:true
    });

    that.shareMoments();
  },

  shareMoments: function () {
    var that = this;
    //没有分享图先用 canvas 生成，否则直接预览
    // if (that.data.targetSharePath) {
    //     that.setData({
    //         realShow: false
    //     })
    // } else {
    that.showLoading();
    that.downloadAvatar();
    //}
  },

  showLoading: function () {
    wx.showLoading({
      title: '加载中...',
    })
  },

  hideLoading: function () {
    wx.hideLoading();
  },

  showErrorModel: function (content) {
    this.hideLoading();
    if (!content) {
      content = '网络错误';
    }
    wx.showModal({
      title: '提示',
      content: content,
    })
  },

  /**
   * 改变字体样式
   */
  setFontStyle: function (ctx, fontWeight) {
    if (wx.canIUse('canvasContext.font')) {
      ctx.font = 'normal ' + fontWeight + ' ' + '14px' + ' sans-serif';
    }
  },

  //下载资源
  downloadAvatar: function () {
    var that = this;
    that.setData({
      imgload:0
    });
    console.log("头像资源："+that.data.avatar);
    const downloadTask1 = wx.downloadFile({
      url: that.data.avatar,
      success: function (res) {
        that.setData({
          avatarPath: res.tempFilePath
        })
      },
      fail: function (err) {
        console.log(err)
        that.showErrorModel();
      }
    });


    downloadTask1.onProgressUpdate((res) => {
      console.log(res.progress)
      if(res.progress == 100){
        console.log('头像下载完成');
        that.setData({
          imgload:that.data.imgload+1
        })
        if(that.data.imgload == 3){
          console.log('执行画画3');
          that.drawImage();
        }
      }
    })

    var bgImageitem = that.data.bgImage[Math.floor(Math.random()*that.data.bgImage.length)];

    wx.downloadFile({
      url: bgImageitem,
      success: function (res) {
        that.setData({
          bgImagePath: res.tempFilePath,
          imgload:that.data.imgload+1
        })
        console.log(that.data.imgload);
        if(that.data.imgload == 3){
          console.log('执行画画2');
          that.drawImage();
        }

      },
      fail: function () {
        that.showErrorModel();
      }
    });
    const downloadTask = wx.downloadFile({
      url: that.data.qurl,
      success: function (res) {
        that.setData({
          qurlPath: res.tempFilePath,
        })
      },
      fail: function () {
        that.showErrorModel();
      }
    })
    downloadTask.onProgressUpdate((res) => {
      console.log(res.progress)
      if(res.progress == 100){
        console.log('二维码下载完成');
        that.setData({
          imgload:that.data.imgload+1
        })
        if(that.data.imgload == 3){
          console.log('执行画画3');
          console.log(that.data.qurlPath);
          that.drawImage();
        }
      }
    })

  },

  drawImage: function () {

    var that = this;
    const ctx = wx.createCanvasContext('myCanvas', this);


    var bgPath = that.data.bgImagePath;
    ctx.setFillStyle("#734c73");
    ctx.fillRect(0, 0, that.data.canvasWidth, that.data.canvasHeight);

    //绘制背景图片
    ctx.drawImage(bgPath, 0, 0, that.data.canvasWidth, that.data.canvasHeight);
    //绘制头像
    ctx.arc(that.data.avatarWidth/2+avatarStrokeWidth+that.data.avatarLeft, that.data.avatarWidth/2+avatarStrokeWidth+that.data.avatarTop, that.data.avatarWidth/2+avatarStrokeWidth, 0, 2 * Math.PI);
    ctx.setFillStyle('#FFFFFF');
    ctx.fill();

    //头像裁剪
    ctx.save();
    ctx.beginPath();
    ctx.arc(that.data.avatarWidth/2+avatarStrokeWidth+that.data.avatarLeft, that.data.avatarWidth/2+avatarStrokeWidth+that.data.avatarTop, that.data.avatarWidth/2, 0, 2 * Math.PI);
    // ctx.setFillStyle("#EEEEEE");
    // ctx.fill();
    ctx.setStrokeStyle("#FFFFFF");
    ctx.stroke();
    ctx.clip();
    var avatarWidth = that.data.avatarWidth;//头像半径


    ctx.drawImage(that.data.avatarPath,that.data.avatarLeft+avatarStrokeWidth,that.data.avatarTop+avatarStrokeWidth, avatarWidth, avatarWidth);
    ctx.restore();

    //用户名
    that.setFontStyle(ctx, 'bold');
    ctx.setFillStyle("#FFFFFF");
    ctx.setFontSize(10);
    ctx.setTextAlign('left');
    ctx.setTextBaseline('top');
    ctx.fillText(stringUtil.substringStr(that.data.nickName),that.data.nickNameLeft,that.data.nickNameTop);

    //


    ctx.save();
    ctx.beginPath();

      console.log('--------:'+that.data.canvasWidth);

    //ctx.arc(that.data.qcodeWidth/2+that.data.avatarLeft*1.1, that.data.qcodeWidth/2+that.data.qcodeTop, that.data.qcodeWidth/2*1.1, 0, 2 * Math.PI);
    ctx.arc(that.data.canvasWidth / 2, that.data.qcodeWidth/2+that.data.qcodeTop, that.data.qcodeWidth/2*1, 0, 2 * Math.PI);
    ctx.setFillStyle("#ffaf00");
    ctx.fill();
    ctx.clip();





    ctx.drawImage(that.data.qurlPath,that.data.canvasWidth / 2-that.data.qcodeWidth/2+avatarStrokeWidth,that.data.qcodeTop, that.data.qcodeWidth,that.data.qcodeWidth);



    //绘制到 canvas 上
    ctx.draw(false, function () {
      console.log('callback--------------->');
      that.saveCanvasImage();
    });
  },

  saveCanvasImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: function (res) {
        console.log(res.tempFilePath);
        that.setData({
          targetSharePath: res.tempFilePath,
          realShow: false
        })
      },
      complete: function () {
        that.hideLoading();
      }
    }, this)
  },
  /**
   * 保存到相册
   */
  saveImageTap: function () {
    var that = this;
    that.requestAlbumScope();
  },

  /**
   * 检测相册权限
   */
  requestAlbumScope: function () {
    var that = this;
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          that.saveImageToPhotosAlbum();
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(res) {
              that.saveImageToPhotosAlbum();
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '你需要授权才能保存图片到相册',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: function (res) {
                        if (res.authSetting['scope.writePhotosAlbum']) {
                          that.saveImageToPhotosAlbum();
                        } else {
                          console.log('用户未同意获取用户信息权限-------->success');
                        }
                      },
                      fail: function () {
                        console.log('用户未同意获取用户信息权限-------->fail');
                      }
                    })
                  }
                }
              })
            }
          })
        }
      }
    })
  },

  saveImageToPhotosAlbum: function () {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.targetSharePath,
      success: function () {
        wx.showModal({
          title: '',
          content: '✌️图片保存成功，\n快去分享到朋友圈吧',
          showCancel: false
        })
        that.hideDialog();
      }
    })
  },

  closesaveImage:function () {
    let that = this;
    that.setData({
      showimgbox:false
    })
  },

    getUserqrcode:function () {
        let that = this;

        let options = {
            url: 'https://werun.renlai.fun/wechat/red/get_user_qrcode',
            data:{
                openId:that.data.visitOpenid
            }
        };
        return Http(options).then((result) => {
            if(result.data.errcode == 0){
                that.setData({
                    qurl:result.data.data.qrcode,
                    avatar:result.data.data.avatarUrl,
                    nickName:result.data.data.nickName
                })
            }else{
                Toast.error(result.data.errmsg);
            }
        });

    },

})