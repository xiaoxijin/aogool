import { getAdminOrderDetail  } from "../../../api/admin";
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '订单详情',
      'color': false
    },
    orderInfo: null,
    order_id:'',
    title: "",
    payType: "",
    types: "",
    change:false,
    status:'', //操作中的状态 一键改价
    price:'',
    refund_price:'',
    type:'',
    remark:'',
    goname:''
  },

   /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.order_id) this.setData({ order_id: options.order_id});
    if (options.goname) this.setData({ goname: options.goname});
  },
  /**
   * 登录授权回调
   * 
  */
  onLoadFun:function(){
    this.getOrderInfo();
  },
  /**
   * 回调
   * 
  */
  getIndex: function () {
    this.getOrderInfo();
  },
  /**
   * 获取订单详细信息
   * 
  */
  getOrderInfo:function(){
    wx.showLoading({ title: "正在加载中" });
    getAdminOrderDetail(this.data.order_id).then(res=>{
      wx.hideLoading();
      this.setData({ 
        orderInfo: res.data, 
        title: res.data._status._title, 
        types: res.data._status._type, 
        payType: res.data._status._payType,
      });
    }).catch(err=>{
      wx.hideLoading();
      app.Tips({ title: err });
    });
  },
  /**
   * 
   * 剪切订单号
  */
  copyOrderId:function(){
    wx.setClipboardData({data: this.data.orderInfo.order_id});
  },
  /**
   * 
   * 操作 一键改价 修改备注 打开组件
  */
  modify:function(e) {
    let status = e.currentTarget.dataset.status;
    this.setData({ 
      change: true, 
      status: status,
      orderInfo: this.data.orderInfo
    });
  },
  
  /**
    * 关闭组件
    * 
   */
  change: function () {
    this.setData({ change: false });
  },
  /**
  * 事件回调
  * 
 */
  onChangeFun: function (e) {
    let opt = e.detail;
    let action = opt.action || null;
    let value = opt.value != undefined ? opt.value : null;
    (action && this[action]) && this[action](value);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
})