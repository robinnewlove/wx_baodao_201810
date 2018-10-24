//index.js
import Auth                     from '../../plugins/auth.plugin'
import Router                     from '../../plugins/router.plugin'
//获取应用实例
const app = getApp();
const avatarStrokeWidth = 2;
const stringUtil = require('../../utils/stringUtil.js');

Page({
  data: {

    maskboxshow:"",
    showimgbox:false,
    btnHelp:false,
    btnMystart:false,
    btnShare:true,

    //画布相关字段
    canvasHeight:"0",
    canvasWidth:"0",
    avatar:'http://www.zhenzhezixun.com/images/logo.png',
    bgImage: ['http://www.zhenzhezixun.com/images/sharebg.jpg'],
    qurl:"http://www.zhenzhezixun.com/images/logo.png",
    imgload:0,
    bgImagePath:"",
    avatarPath:"",
    qurlPath:"",
    targetSharePath: null,
    avatarWidth:'0',
    avatarLeft:"",
    avatarTop:"",
    nickName:"亲爱的用户",
    nickNameTop:"123",
    nickNameLeft:"",
    qcodeTop:"",
    qcodeWidth:0,

  },
  onLoad: function () {

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
          avatarWidth:scaleNum*173,
          avatarTop:scaleNum*113,
          avatarLeft:scaleNum*61,
          nickNameTop:scaleNum*172,
          nickNameLeft:scaleNum*292,
          qcodeTop:scaleNum*1016,
          qcodeWidth:scaleNum*250*0.8
        })


        //console.log("qcodeWidth:"+that.data.qcodeWidth)
      },
    }),
        wx.showShareMenu({
          withShareTicket: true
        });
  },
  // 生命周期回调—监听页面显示
  onShow () {
    Auth.getToken().then((info) => {
      //this.firFun(info);
      //console.log("getToken:"+info);
  }).catch(() => {
      Router.push('authorization_index');
  });
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
    ctx.setFillStyle("#000000");
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
    ctx.setFontSize(20);
    ctx.setTextAlign('left');
    ctx.setTextBaseline('top');
    ctx.fillText(stringUtil.substringStr(that.data.nickName),that.data.nickNameLeft,that.data.nickNameTop);

    //


    ctx.save();
    ctx.beginPath();
    ctx.arc(that.data.qcodeWidth/2+that.data.avatarLeft*1.1, that.data.qcodeWidth/2+that.data.qcodeTop, that.data.qcodeWidth/2*1.1, 0, 2 * Math.PI);
    ctx.setFillStyle("#FFFFFF");
    ctx.fill();
    ctx.clip();





    ctx.drawImage(that.data.qurlPath,that.data.avatarLeft+avatarStrokeWidth,that.data.qcodeTop, that.data.qcodeWidth,that.data.qcodeWidth);



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
  }

})