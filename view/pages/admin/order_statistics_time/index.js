
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '自定义',
      'color': false
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
  * 日期选择
  * 
  */
  onPickDay(e) {
    let start = e.detail[0].split('-');
    let stop = e.detail[1].split('-');
    let starts = new Date(Date.parse(start[0] + "/" + start[1] + "/" + start[2])).getTime() / 1000;
    let stops = new Date(Date.parse(stop[0] + "/" + stop[1] + "/" + stop[2])).getTime() / 1000 + 24 * 60 * 60 - 1;
    // this.setData({
    //   start: new Date(Date.parse(start[0] + "/" + start[1] + "/" + start[2])).getTime() / 1000,
    //   stop: new Date(Date.parse(stop[0] + "/" + stop[1] + "/" + stop[2])).getTime() / 1000 + 24 * 60 * 60 - 1
    // });
    let pages = getCurrentPages();   //当前页面
    let prevPage = pages[pages.length - 2];   //上一页面
    prevPage.setData({
      start: starts,
      stop: stops
    });
    wx.navigateBack({ delta: 1 });
  }
})