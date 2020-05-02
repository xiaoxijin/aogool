import { 
  getBargainDetail, 
  postBargainStartUser,
  postBargainStart, 
  postBargainHelpPrice, 
  postBargainHelpCount, 
  postBargainHelp, 
  postBargainHelpList, 
  postBargainShare
} from '../../../api/activity.js';
import { postCartAdd } from '../../../api/store.js';
import wxh from '../../../utils/wxh.js';
import WxParse from '../../../wxParse/wxParse.js';
import util from '../../../utils/util.js';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    countDownDay: '00',
    countDownHour: '00',
    countDownMinute: '00',
    countDownSecond: '00',
    active: false,
    id:0,//砍价产品编号
    userInfo:{},//当前用户信息
    bargainUid: 0,//开启砍价用户
    bargainUserInfo: {},//开启砍价用户信息
    bargainUserId: 0,//开启砍价编号
    bargainInfo:[],//砍价产品
    offset:0,
    limit:20,
    limitStatus:false,
    bargainUserHelpList:[],
    bargainUserHelpInfo:[],
    bargainUserBargainPrice:0,
    status:'', // 0 开启砍价   1  朋友帮忙砍价  2 朋友帮忙砍价成功 3 完成砍价  4 砍价失败 5已创建订单
    bargainCount:[],//分享人数  浏览人数 参与人数
    retunTop:true,
    bargainPartake:0,
    isHelp:false,
    interval:null,
    userBargainStatus:0,//判断自己是否砍价
    productStock:0,//判断是否售罄；
    quota:0,//判断是否已限量；
    userBargainStatusHelp:true,
    navH: '',
    statusPay:'',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navH: app.globalData.navHeight
    });
    var that = this;
    var pages = getCurrentPages();
    if (pages.length <= 1) that.setData({ retunTop:false});
    //扫码携带参数处理
    if (options.scene) {
      var value = util.getUrlParams(decodeURIComponent(options.scene));
      if (typeof value === 'object'){
        if (value.id) options.id = value.id;
        if (value.bargain) options.bargain = value.bargain;
        //记录推广人uid
        if (value.pid) app.globalData.spid = value.pid;
      }else{
        app.globalData.spid = value;
      }
    }
    if (options.hasOwnProperty('id')) {
      this.setData({ id: options.id, bargainUid: options.bargain || 0 });
    }
  },
  /**
   * 跳转到商品页面
   */
  goProduct:function(){
    return app.Tips('/pages/goods_details/index?id=' + this.data.bargainInfo.product_id);
  },
  goBack: function () {
    wx.navigateBack({ delta: 1 })
  },
  gobargainUserInfo:function(){//获取开启砍价用户信息
    var that = this;
    var data = { bargainId: that.data.id, bargainUserUid: that.data.bargainUid };
    postBargainStartUser(data).then(res=>{
      that.setData({ bargainUserInfo: res.data });
    });
  },
  goPay: function () {//立即支付
    var that = this;
    var data = { 
      productId: that.data.bargainInfo.product_id,
      bargainId: that.data.id, 
      cartNum: that.data.bargainInfo.num,
      uniqueId:'',
      combinationId:0,
      secKillId:0,
      'new':1
    };
    postCartAdd(data).then(res=>{
      wx.navigateTo({ url: '/pages/order_confirm/index?cartId=' + res.data.cartId });
    }).catch(err=>{
      return app.Tips({title:err})
    });
  },
  getBargainDetails:function(){//获取砍价产品详情
    var that = this;
    var id = that.data.id;
    getBargainDetail(id).then(function(res){
      that.setData({ 
        bargainInfo: res.data.bargain, 
        bargainPrice:res.data.bargain.price,
        userInfo: res.data.userInfo, 
        bargainSumCount: res.data.bargainSumCount,
        userBargainStatus: res.data.userBargainStatus,
        productStock: res.data.bargain.attr.product_stock,
        quota: res.data.bargain.attr.quota
      });
      app.globalData.openPages = '/pages/activity/goods_bargain_details/index?id=' + that.data.id + '&bargain=' + that.data.bargainUid + '&scene=' + that.data.userInfo.uid;
      WxParse.wxParse('description', 'html', that.data.bargainInfo.description || '', that, 0); 
      WxParse.wxParse('rule', 'html', that.data.bargainInfo.rule || '', that, 0); 
      wxh.time2(that.data.bargainInfo.stop_time, that);
      that.getBargainHelpCount();
      that.setData({ bargainUserHelpList: [] });
      that.getBargainUser();
      that.gobargainUserInfo();
    }).catch(function(err){
      return app.Tips({ title: err }, { tab: 3, url: 1 });
    })
  },
  // 自己砍价；
  userBargain:function(){
    let that = this;
    if (that.data.userInfo.uid == that.data.bargainUid){
      that.setBargain();
    }
  },
  getBargainHelpCount: function () {//获取砍价帮总人数、剩余金额、进度条、已经砍掉的价格
    var that = this;
    var data = { bargainId: that.data.id, bargainUserUid:that.data.bargainUid };
    postBargainHelpCount(data).then(res=>{
      var price = util.$h.Sub(that.data.bargainPrice, res.data.alreadyPrice);
      that.setData({
        bargainUserHelpInfo: res.data,
        'bargainInfo.price': parseFloat(price) <= 0 ? 0 : price,
        userBargainStatusHelp: res.data.userBargainStatus,
        statusPay: res.data.status
      });
    })
  },
  currentBargainUser:function(){//当前用户砍价
    this.setData({ bargainUid:this.data.userInfo.uid });
    this.setBargain();
  },
  setBargain:function(){//参与砍价
    var that = this;
    postBargainStart(that.data.id).then(res=>{
      that.setData({ bargainUserId: res.data });
      that.getBargainUserBargainPrice();
      that.setBargainHelp();
      that.getBargainHelpCount();
      that.setData({
        userBargainStatus:1
      })
    })
  },
  setBargainHelp: function () {//帮好友砍价
    var that = this;
    var data = { bargainId: that.data.id, bargainUserUid: that.data.bargainUid };
    postBargainHelp(data).then(res=>{
      that.setData({ bargainUserHelpList: [],isHelp:true });
      that.getBargainUser();
      that.getBargainUserBargainPrice();
      that.getBargainHelpCount();
    }).catch(err=>{
      that.setData({ bargainUserHelpList: [] }); 
      that.getBargainUser();
    })
  },
  getBargainUser: function () {//获取砍价帮
    var that = this;
    var data = { 
      bargainId: that.data.id, 
      bargainUserUid: that.data.bargainUid,
      offset: that.data.offset,
      limit: that.data.limit,
    };
    postBargainHelpList(data).then(res=>{
      var bargainUserHelpListNew = [];
      var bargainUserHelpList = that.data.bargainUserHelpList;
      var len = res.data.length;
      bargainUserHelpListNew = bargainUserHelpList.concat(res.data);
      that.setData({ bargainUserHelpList: bargainUserHelpListNew, limitStatus: data.limit > len, offest: Number(data.offset) + Number(data.limit) });
    });
  },
  getBargainUserBargainPricePoster:function(){
    var that = this;
    wx.navigateTo({
      url: '/pages/activity/poster-poster/index?type=1&id=' + that.data.id,
    });
  },
  getBargainUserBargainPrice: function () {//获取帮忙砍价砍掉多少金额
    var that = this;
    var data = {bargainId: that.data.id,bargainUserUid: that.data.bargainUid};
    postBargainHelpPrice(data).then(res=>{
      that.setData({ bargainUserBargainPrice: res.data, active: true });
    }).catch(err=>{
      that.setData({ active: false });
    });
  },
  goBargainList:function(){
     wx.navigateTo({
       url: '/pages/activity/goods_bargain/index',
     })
  },
  close:function(){
    this.setData({
      active: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onLoadFun: function (e) {
    let uid = e.detail.uid;
    if(!this.data.bargainUid && uid){
      this.setData({bargainUid:uid});
    }
    if(!this.data.bargainUid){
      return app.Tips({ title:'参数错误'},{tab:3,url:1})
    }
    this.getBargainDetails();
    this.addShareBargain();
    app.globalData.openPages = '/pages/activity/goods_bargain_details/index?id=' + this.data.id + '&bargain=' + this.data.bargainUid + '&spid=' + e.detail.uid;
    this.setData({ bargainPartake: e.detail.uid});
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.data.interval !== null) clearInterval(this.data.interval);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.data.interval !== null) clearInterval(this.data.interval);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  addShareBargain: function () {//添加分享次数 获取人数
    var that = this;
    postBargainShare(this.data.id).then(res=>{
      that.setData({ bargainCount: res.data })
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    that.close();
    that.addShareBargain();
    return {
      title: '您的好友' + that.data.userInfo.nickname + '邀请您帮他砍' + that.data.bargainInfo.title+' 快去帮忙吧！',
      path: app.globalData.openPages,
      imageUrl: that.data.bargainInfo.image,
    }
  }
})