import { getAdminOrderDelivery, getLogistics, setAdminOrderDelivery } from "../../../api/admin";
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '订单发货',
      'color': false
    },
    types: [
      {
        type: "express",
        title: "发货"
      },
      {
        type: "send",
        title: "送货"
      },
      {
        type: "fictitious",
        title: "无需发货"
      }
    ],
    order_id: '',
    delivery:{},
    active: 0,
    delivery_type: "express",
    logistics: [],
    index:0,
    // delivery_id: "",
    // delivery_name:'',
    // delivery_phone:''
  },

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    if (options.order_id) this.setData({ order_id: options.order_id });
  },
  /**
   * 登录授权回调
   * 
  */
  onLoadFun: function () {
    this.getOrderInfo();
    this.getLogisticsChange();
  },
  /**
   * 快递公司选择
   * 
  */
  bindPickerChange: function (e) {
    this.setData({ index: e.detail.value });
  },
  /**
  * 提交
  */
  formSubmit: function (e) {
    let save = {};
    save.order_id = this.data.order_id;
    save.delivery_type = this.data.delivery_type;
    switch (this.data.delivery_type) {
      case "send":
        if (!e.detail.value.delivery_name) return app.Tips({ title: '请填写送货人' });
        if (!e.detail.value.delivery_phone) return app.Tips({ title: '请填写送货电话' });
        if (!/^1(3|4|5|7|8|9|6)\d{9}$/i.test(e.detail.value.delivery_phone)) return app.Tips({ title: '输入正确的手机号码' });
        save.delivery_name = e.detail.value.delivery_name;
        save.delivery_id = e.detail.value.delivery_phone;
        this.setInfo(save);
        break;
      case "express":
        if (!e.detail.value.delivery_id) return app.Tips({ title: '请填写快递单号' });
        save.delivery_name = this.data.logistics[this.data.index];
        save.delivery_id = e.detail.value.delivery_id;
        this.setInfo(save);
        break;
      case "fictitious":
        this.setInfo(save);
        break;
    }
  },
  setInfo: function (save) {
    setAdminOrderDelivery(save).then(res => {
      app.Tips({ title: res.msg, icon: 'success' });
      setTimeout(function () {
        wx.navigateBack({ delta: 1 });
      }, 500);
    }).catch(err => {
      return app.Tips({ title: err });
    })
  },
  /**
   * 快递公司
   * 
  */
  getLogisticsChange: function () {
    let logisticsArr = [];
    getLogistics().then(res => {
      res.data.map((item) => {
        logisticsArr.push(item.name)
      })
      this.setData({
        logistics: logisticsArr
        });
    }).catch(err => {
      app.Tips({ title: err });
    });
  },
  /**
   *选择
  */
  changeType: function (e) {
    this.setData({ 
      active: e.currentTarget.dataset.indexs, 
      delivery_type: e.currentTarget.dataset.rows.type
    });
  },
  /**
   * 获取订单发货详细信息
   * 
  */
  getOrderInfo: function () {
    wx.showLoading({ title: "正在加载中" });
    getAdminOrderDelivery(this.data.order_id).then(res => {
      wx.hideLoading();
      this.setData({
        delivery: res.data
      });
    }).catch(err => {
      wx.hideLoading();
      app.Tips({ title: err });
    });
  },
  /**
   * 
   * 剪切订单号
  */
  copyOrderId: function () {
    wx.setClipboardData({ data: this.data.orderInfo.order_id });
  },
  /**
   * 
   * 操作 一键改价 修改备注 打开组件
  */
  modify: function (e) {
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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

  }
})