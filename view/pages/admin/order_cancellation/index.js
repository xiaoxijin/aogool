import { orderVerific } from "../../../api/admin";
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '订单核销',
      'color': false
    },
    verify_code:'',
    orderInfo: {},
    iShidden: false,
  },
  close: function () {
  },
  /**
    * 去订单详情
   */
  goOrderDetails: function (e) {
    var order_id = e.currentTarget.dataset.order_id;
    wx.navigateTo({ url: '/pages/admin/order_details/index?order_id=' + order_id + '&goname=look'});
  },
  /**
  * 核销码
  */
  bindCode: function (e) {
    this.setData({ verify_code: e.detail.value });
  },
   /**
  * 立即销码
  */
  codeChange: function () {
    let ref = /[0-9]{12}/;
    if (!this.data.verify_code) return app.Tips({ title: '请输入核销码' });
    if (!ref.test(this.data.verify_code)) return app.Tips({ title: '请输入正确的核销码' });
    app.Tips({ title: '查询中' });
    setTimeout(() => {
      orderVerific(this.data.verify_code, 0)
        .then(res => {
          this.setData({
            orderInfo: res.data,
            iShidden: true
          });
        })
        .catch(res => {
          this.setData({
            verify_code: ''
          });
          return app.Tips({ title: res });
        });
    }, 800);
  },
   /**
  * 扫码核销
  */
  scanCode: function () {
    var myThis = this;
    wx.scanCode({
      scanType: ["qrCode", "barCode"],
      success(res) {
        myThis.setData({
          verify_code: res.result
        })
        myThis.codeChange();
      },
      fail(res) {
        console.log(res);
       // app.Tips({ title: res });
        // if (res.errMsg == "scanQRCode:permission denied") {
        //   app.Tips({ title: "没有权限"});
        // }
      },
      // complete(res){
      //   console.log(res);
      // }
    })
  },
   /**
  * 确定销码
  */
  confirm: function () {
    orderVerific(this.data.verify_code, 1)
      .then(res => {
        this.setData({
          verify_code: '',
          iShidden:false
        });
        app.Tips({ title: res.msg });
      })
      .catch(res => {
        app.Tips({ title: res });
      });
  },
   /**
  * 取消
  */
  cancel: function () {
    this.setData({
      iShidden: false
    });
  },
  /**
   * 授权回调
  */
  onLoadFun: function (e) {
    
  },
  Setting: function () {
  },
})