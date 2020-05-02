import { getAdminOrderList, setOfflinePay } from "../../../api/admin";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '订单列表',
      'color': false
    },
    loading: false,//是否加载中
    loadend: false,//是否加载完毕
    loadTitle: '加载更多',//提示语
    orderList: [],//订单数组
    orderStatus: 0,//订单状态
    page: 1,
    limit: 10,
    isClose: false,
    orderInfo: null,
    change: false,
    navH:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.status) this.setData({ orderStatus: options.status });
    this.setData({ orderStatus: options.orderStatus, navH: app.globalData.navHeight});
  },
  /**
  * 登录回调
  * 
 */
  onLoadFun: function () {
    this.getOrderList();
  },
  /**
   * 
   * 操作 一键改价 修改备注 打开组件
  */
  modify: function (e) {
    let status = e.currentTarget.dataset.status;
    let orderInfo = e.currentTarget.dataset.orderinfo;
    this.setData({
      change: true,
      status: status,
      orderInfo: orderInfo
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
  * 确认付款
  */
  offlinePay: function (e) {
    let orderinfo = e.currentTarget.dataset.orderinfo;
    setOfflinePay({ order_id: orderinfo.order_id }).then(
      res => {
        app.Tips({ title: res.msg });
        this.setData({ loadend: false, page: 1, orderList: [] });
        this.getOrderList();
      },
      error => {
        app.Tips({ title: error.msg });
      }
    );
  },
  /**
   * 切换
   */
  changeStatus: function (e) {
    var status = e.currentTarget.dataset.status;
    if (status == this.data.orderStatus) return;
    this.setData({ orderStatus: status, loadend: false, page: 1, orderList: [] });
    this.getOrderList();
  },
  /**
   * 回调
   * 
  */
  getIndex: function () {
    this.setData({ loadend: false, page: 1, orderList: [] });
    this.getOrderList();
  },
  /**
  * 获取订单列表
 */
  getOrderList: function () {
    if (this.data.loadend) return;
    if (this.data.loading) return;
    this.setData({ loading: true, loadTitle: "" });
    getAdminOrderList({
      status: this.data.orderStatus,
      page: this.data.page,
      limit: this.data.limit,
    }).then(res => {
      var list = res.data || [];
      var loadend = list.length < this.data.limit;
      this.data.orderList = app.SplitArray(list, this.data.orderList);
      this.setData({
        orderList: this.data.orderList,
        loadend: loadend,
        loading: false,
        loadTitle: loadend ? "我也是有底线的" : '加载更多',
        page: this.data.page + 1,
      });
    }).catch(err => {
      this.setData({ loading: false, loadTitle: "加载更多" });
    })
  },
  /**
    * 去订单详情
   */
  goOrderDetails: function (e) {
    var order_id = e.currentTarget.dataset.order_id;
    wx.navigateTo({ url: '/pages/admin/order_details/index?order_id=' + order_id });
  },
  /**
    * 生命周期函数--监听页面显示
    */
  onShow: function () {
    if (app.globalData.isLog && this.data.isClose) {
      this.setData({ loadend: false, page: 1, orderList: [] });
      this.getOrderList();
    }
  },
  /**
    * 生命周期函数--监听页面隐藏
    */
  onHide: function () {
    this.setData({ isClose: true });
  },
  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
    this.getOrderList();
  },
})