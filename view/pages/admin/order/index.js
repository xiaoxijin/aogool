import { getStatisticsInfo, getStatisticsMonth } from "../../../api/admin";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '订单统计',
      'color': false
    },
    loading:false,//是否加载中
    loadend:false,//是否加载完毕
    loadTitle:'加载更多',//提示语
    census:{},
    list: [],
    page: 1,
    limit: 15,
    dataList:[],
    isClose:false
  },
    /**
   * 登录回调
   * 
  */
  onLoadFun:function(){
    this.getIndex();
    this.getList();
  },
   /**
   * 获取订单数据
  */
  getIndex:function(){
    if(this.data.loadend) return;
    if(this.data.loading) return;
    getStatisticsInfo().then(res=>{
      this.setData({ census: res.data });
    }).catch(err=>{
      return app.Tips({title:err});
    });
  },
   /**
   * 获取详细数据
  */
  getList:function(){
    if(this.data.loadend) return;
    if(this.data.loading) return;
    this.setData({ loading: true, loadTitle:""});
    getStatisticsMonth({
      page: this.data.page,
      limit: this.data.limit
    }).then(res=>{
      let list = res.data || [];
      let loadend = list.length < this.data.limit;
      this.data.dataList = app.SplitArray(list, this.data.dataList);
      this.setData({
        dataList: this.data.dataList,
        loadend: loadend,
        loading: false,
        loadTitle: loadend ? "我也是有底线的" : '加载更多',
        page: this.data.page + 1,
      });
    }).catch(err=>{
      this.setData({ loading: false, loadTitle: "加载更多" });
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ isClose:true});
  },
   /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.isLog && this.data.isClose){
      this.setData({ loadend: false, page: 1, dataList:[]});
      this.getList();
    }
  },
   /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getList();
  },
})