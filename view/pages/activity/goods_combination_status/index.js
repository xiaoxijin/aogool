// pages/group-con/index.js
import { getCombinationPink, postCombinationRemove } from '../../../api/activity.js';
import { postCartAdd } from '../../../api/store.js';
import wxh from '../../../utils/wxh.js';
import util from '../../../utils/util.js';

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '开团',
      'color': false,
    },
    countDownHour:'00',
    countDownMinute:'00',
    countDownSecond:'00',
    iShidden: false,
    count:0,//还差多少人拼团完成
    isOk:0,//是否拼团完成
    pinkAll:[],//当前拼团列表
    pinkBool:0,
    pinkT:{},//团长信息
    storeCombination:{},//当前拼团产品详情
    userBool:0,//是否为本人开团
    current_pink_order:'',//当前订单号
    userInfo:{},
    isClose:0,
    productAttr: [],
    productSelect: [],
    productValue:[],
    storeInfo:{},
    iSbnt:1,
    limitNum:1,
    iSplus:false,
    attribute: {
      'cartAttr': false
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //扫码携带参数处理
    if (options.scene) {
      var value = util.getUrlParams(decodeURIComponent(options.scene));
      if (value.id) options.id = value.id;
      //记录推广人uid
      if (value.pid) app.globalData.spid = value.pid;
    }
    if(!options.id) return app.Tips({title:'缺少参数'},{tab:3,url:1});
    this.setData({pinkId: options.id});
  },
  onMyEvent: function (e) {
    this.setData({ 'attribute.cartAttr': e.detail.window})
  },
  /**
   * 授权回调
  */
  onLoadFun:function(){
    this.getPink();
  },
  /**
* 购物车手动填写
* 
*/
  iptCartNum: function (e) {
    this.data.productSelect.cart_num = e.detail;
    this.setData({
      productSelect: this.data.productSelect,
      cart_num: e.detail
    })
  },
  /**
* 默认选中属性
* 
*/
  DefaultSelect: function () {
    var productAttr = this.data.productAttr, storeInfo = this.data.storeInfo, productValue = this.data.productValue, value = [];
    for (var key in productValue) {
      if (productValue[key].quota > 0 && productValue[key].product_stock > 0) {
        value = this.data.productAttr.length ? key.split(",") : [];
        break;
      }
    }
    for (var i = 0, len = productAttr.length; i < len; i++) {
      if (productAttr[i].attr_value[0]) productAttr[i].checked = value[i];
    }
    var productSelect = this.data.productValue[value.sort().join(',')];
    if (productSelect) {
      this.setData({
        ["productSelect.store_name"]: storeInfo.store_name,
        ["productSelect.image"]: productSelect.image,
        ["productSelect.price"]: productSelect.price,
        ["productSelect.quota"]: productSelect.quota,
        ["productSelect.stock"]: productSelect.stock,
        ["productSelect.quota_show"]: productSelect.quota_show,
        ["productSelect.product_stock"]: productSelect.product_stock,
        ['productSelect.unique']: productSelect.unique,
        ['productSelect.cart_num']: 1,
        attrValue: value,
        attr: '已选择'
      });
    } else {
      this.setData({
        ["productSelect.store_name"]: storeInfo.store_name,
        ["productSelect.image"]: storeInfo.image,
        ["productSelect.price"]: storeInfo.price,
        ["productSelect.quota_show"]: 0,
        ["productSelect.quota"]: 0,
        ['productSelect.unique']: '',
        ['productSelect.cart_num']: this.data.productAttr.length ? 0 : 1,
        attrValue: '',
        attr: '请选择'
      });
    }
    this.setData({ productAttr: productAttr });
  },
  /**
 * 购物车数量加和数量减
 * 
*/
  ChangeCartNum: function (e) {
      //是否 加|减
      var changeValue = e.detail;
      //获取当前变动属性
      var productSelect = this.data.productValue[this.data.attrValue];
      if(this.data.cart_num){
        productSelect.cart_num = this.data.cart_num;
      }
      //如果没有属性,赋值给商品默认库存
      if (productSelect === undefined && !this.data.productAttr.length) productSelect = this.data.productSelect;
      //不存在不加数量
      if (productSelect === undefined) return;
      //提取库存
      var stock = productSelect.stock || 0;
      var quotaShow = productSelect.quota_show || 0;
      var productStock = productSelect.product_stock || 0;
      //设置默认数据
      if (productSelect.cart_num == undefined) productSelect.cart_num = 1;
      //数量+
    console.log(this.data.productSelect.cart_num);
      if (changeValue) {
        productSelect.cart_num++;
        //大于库存时,等于库存
        if (quotaShow >= productStock) {
          if (productSelect.cart_num >= productStock) productSelect.cart_num = productStock;
        } else {
          if (productSelect.cart_num >= quotaShow) productSelect.cart_num = quotaShow;
        }
        this.setData({
          ['productSelect.cart_num']: productSelect.cart_num,
          cart_num: productSelect.cart_num
        });
      } else {
        //数量减
        productSelect.cart_num--;
        //小于1时,等于1
        if (productSelect.cart_num < 1) productSelect.cart_num = 1;
        this.setData({
          ['productSelect.cart_num']: productSelect.cart_num,
          cart_num: productSelect.cart_num
        });
      }
  },
  /**
   * 属性变动赋值
   * 
  */
  ChangeAttr: function (e) {
    var values = e.detail;
    var productSelect = this.data.productValue[values];
    var storeInfo = this.data.storeInfo;
    this.setData({
      cart_num: 1
    });
    if (productSelect) {
      this.setData({
        ["productSelect.image"]: productSelect.image,
        ["productSelect.price"]: productSelect.price,
        ["productSelect.quota"]: productSelect.quota,
        ["productSelect.stock"]: productSelect.stock,
        ["productSelect.quota_show"]: productSelect.quota_show,
        ["productSelect.product_stock"]: productSelect.product_stock,
        ['productSelect.unique']: productSelect.unique,
        ['productSelect.cart_num']: 1,
        attrValue: values,
        attr: '已选择'
      });
    } else {
      this.setData({
        ["productSelect.image"]: storeInfo.image,
        ["productSelect.price"]: storeInfo.price,
        ["productSelect.quota_show"]: 0,
        ["productSelect.quota"]: 0,
        ['productSelect.unique']: '',
        ['productSelect.cart_num']: 0,
        attrValue: '',
        attr: '请选择'
      });
    }
  },
  setProductSelect: function () {
    var that = this;
    if (that.data.productSelect.length == 0) {
      that.setData({
        ['productSelect.image']: that.data.storeInfo.image,
        ['productSelect.store_name']: that.data.storeInfo.title,
        ['productSelect.price']: that.data.storeInfo.price,
        ['productSelect.quota']: that.data.storeInfo.stock,
        ['productSelect.unique']: '',
        ['productSelect.cart_num']: 1
      })
    }
  },
  // 打开海报页面
  getPinkPoster: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/activity/poster-poster/index?type=2&id=' + that.data.pinkId,
    });
  },
  /**
   * 获取拼团
  */
  getPink:function(){
    var that = this, id = that.data.pinkId;
    getCombinationPink(id).then(function(res){
      var title ='开团';
      that.setData({
        count: parseInt(res.data.count),
        isOk: res.data.is_ok,
        pinkAll: res.data.pinkAll,
        current_pink_order: res.data.current_pink_order,
        pinkBool: res.data.pinkBool,
        pinkT: res.data.pinkT,
        storeCombination: res.data.store_combination,
        storeCombinationHost: res.data.store_combination_host,
        userBool: res.data.userBool,
        userInfo: res.data.userInfo,
        productAttr:res.data.store_combination.productAttr,
        storeInfo: res.data.store_combination,
        productValue: res.data.store_combination.productValue
      });
      that.setProductSelect();
      that.DefaultSelect();
      if (that.data.isOk && !that.data.count){
        title ='拼团成功，等待商家发货';//拼团完成
      } else if (that.data.isOk && that.data.count){
        title = '拼团失败';//拼团失败
      } else if (that.data.userBool && !that.data.isOk){
        title = that.data.pinkT.uid == that.data.userInfo.uid ? '开团成功' : '拼团成功';//本人开团成功
        wxh.time(that.data.pinkT.stop_time, that);
      } else if (!that.data.userBool && !that.data.isOk){
        title = '参团';//本人参团
        wxh.time(that.data.pinkT.stop_time, that);
      }
      that.setData({'parameter.title':title});
    });
  },
  /**
   * 再次开团
  */
  againPink:function(){
    return app.Tips('/pages/activity/goods_combination_details/index?id='+this.data.storeCombination.id);
  },
 /**
   * 控制属性弹窗
  */
  goPinkOrder:function(e){
    let that = this;
      that.setData({
      'attribute.cartAttr': true
    }); 
    // let data = {
    //   productId: that.data.storeCombination.product_id,
    //   cartNum: that.data.pinkT.total_num,
    //   uniqueId: '',
    //   combinationId: that.data.storeCombination.id,
    //   secKillId: 0
    // };
    // postCartAdd(data).then(function(res){
    //   return app.Tips('/pages/order_confirm/index?cartId=' + res.data.cartId +'&pinkId='+that.data.pinkT.id);
    // }).catch(err=>{
    //   return app.Tips({title:err});
    // });
  },
  /**
   * 下单
  */
  goCat: function () {
    var that = this;
    var productSelect = that.data.productValue[that.data.attrValue];
    //如果有属性,没有选择,提示用户选择
    if (that.data.productAttr.length && productSelect === undefined) return app.Tips({ title: '请选择属性' });
    var data = {
      productId: that.data.storeInfo.product_id,
      secKillId: 0,
      bargainId: 0,
      combinationId: that.data.storeCombination.id,
      cartNum: that.data.cart_num,
      uniqueId: productSelect !== undefined ? productSelect.unique : '',
      is_new: 1,
    };
    postCartAdd(data).then(function (res) {
      wx.navigateTo({ url: '/pages/order_confirm/index?cartId=' + res.data.cartId + '&pinkId=' + that.data.pinkT.id});
    }).catch(function(res){
      return app.Tips({ title: res });
    })
  },
  /**
   * 取消开团
   * 
  */
  removePink:function(e){
    let that = this, data = {
      id: this.data.pinkId,
      cid: this.data.storeCombination.id,
    }
    postCombinationRemove(data).then(function(res){
      if(res.data.status){
        switch (res.data.status) {
          case '200':
            app.Tips({title:res.data.msg});
            that.getPink();
          break;
        }
      }else{
        return app.Tips({ title: res.msg, icon: 'success' }, { tab: 4, url:'/pages/order_list/index?is_return=1'});
      }
    }).catch(function (res) {
      return app.Tips({ title: res.msg }, { tab: 3, url: 1 });
    })
  },
  lookAll:function(){
     this.setData({iShidden: !this.data.iShidden})
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.isClose) this.getPink();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ isClose:1});
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.userInfo.nickname + '邀请您参团',
      path: '/pages/activity/goods_combination_status/index?id=' + this.data.pinkId,
      imageUrl: this.data.storeCombination.image,
      success: function (){
        return app.Tips({ title: '分享成功',icon: 'success'});
      }
    };
  }
})