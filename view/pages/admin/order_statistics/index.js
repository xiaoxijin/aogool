import { getStatisticsTime,getStatisticsMonth  } from "../../../api/admin"; 
import * as echarts from './../components/ec-canvas/echarts';
const app = getApp();
let chart = null;
var option = {}
Page({
  /**
   * 组件的初始数据
   */
  data: {
    ec: {
      lazyLoad: true
    },
    xData:[],
    yData:[],
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '',
      'color': false
    },
    start:'',
    stop:'',
    type: '',
    title:'',
    time:'',
    growth_rate: "", //增长率
    increase_time: "", //增长率
    increase_time_status: "", //增长率
    time_price: "", //增长率
    loading:false,//是否加载中
    loadend:false,//是否加载完毕
    loadTitle:'加载更多',//提示语
    page: 1,
    limit: 15,
    dataList:[],
    isClose:false,
    imageWidth:'',
    current:false,
    isRange:true,
  },
  touchHandler(e) {
    console.log(chartLine.getCurrentDataIndex(e))
  },
  /**
  * 日期选择
  * 
  */
  onPickDay(e){
    let start = e.detail[0].split('-');
    let stop =  e.detail[1].split('-');
    this.setData({
      start: new Date(Date.parse(start[0] + "/" + start[1] + "/" + start[2])).getTime() /1000,
      stop:new Date( Date.parse(stop[0] + "/" + stop[1] + "/" + stop[2])).getTime() /1000 +24 * 60 * 60 -1
    });
  },
  close(){
    this.setData({
      current: false
    });
    this.getIndex();
    this.setData({ loadend: false, page: 1, dataList: [] });
    this.getList();
  },
  // 2、进行初始化数据
  initChartOption:function(xData, yData) {
    return {
    backgroundColor: "#fff",
      color: ["#37A2DA", "#f2960d", "#67E0E3", "#9FE6B8"],
      title: {
        textStyle: {
          fontWeight: '500',
          fontSize: 15,
          color: '#000'
        },
        x:'center',
        y:'0'
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [""]
      },
      toolbox: {
        show: false,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line"] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      calculable: true,
      xAxis: {
        type: 'category',
        data: xData,
        boundaryGap: false,
        splitLine: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: "#999",
            width: 1 //这里是为了突出显示加上的
          }
        }
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: true,
            lineStyle: {
              color: ["#f5f5f5"],
              width: 1,
              type: "solid"
            }
          },
          axisLine: {
            lineStyle: {
              color: "#999",
              width: 1 //这里是为了突出显示加上的
            }
          }
        }
      ],
      series: [{
          data: yData,
          type: 'line',
          itemStyle: {
            normal: {
              color: "#2291f8", //折点颜色
              lineStyle: {
                color: "#2291f8" //折线颜色
              }
            }
          }
      }],
      grid: {
         left : '0%',   //组件离容器左侧的距离
         right : '0%',
         bottom : '4%',
         containLabel : true   
      },
      animationDuration: 1000
    }
  },
    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.barComponent = this.selectComponent('#mychart-one');
    // this.handleCanvarToImg();
    this.setData({ 
      type: options.type,
      time: options.time,
      parameter: {
        title: options.type==='1'?'营业额统计':'订单数据统计',
        navbar: '1',
        return: '1',
        color: false
      }
    });  
  },
  /**
  * 登录回调
  * 
  */
  onLoadFun: function () {
    this.oneComponent = this.selectComponent('#mychart-one');
    this.setTime(this.data.time);
  },
  
  handleCanvarToImg() {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 260,
      height: 180,
      canvasId: 'mychart-bar',
      success: function(res) {
        this.setData({ radarImg: res.tempFilePath});
      }
    });
  },
  /**
  * 打开自定义
  * 
  */
  dateTitle: function() {
    wx.navigateTo({
      url: '/pages/admin/order_statistics_time/index'
    })
  },
  getIndex: function () {
    let that = this;
    getStatisticsTime({
      start: that.data.start,
      stop: that.data.stop,
      type: that.data.type
    }).then(
      res => {
        let _info = res.data.chart || [],
          day = [],
          num = [];
        _info.forEach(function (item) {
          day.push(item.time);
          num.push(item.num);
        });
        that.setData({
          growth_rate: res.data.growth_rate,
          increase_time: res.data.increase_time,
          increase_time_status: res.data.increase_time_status,
          time_price: res.data.time,
          xData:day,
          yData:num
        });
        that.barComponent.init((canvas, width, height) => {
          // 初始化图表
          const barChart = echarts.init(canvas, null, {
            width: width,
            height: height
          });
          barChart.setOption(that.initChartOption(day,num));
          // 注意这里一定要返回 chart 实例，否则会影响事件处理等
          return barChart;
        });
      },
      error => {
        app.Tips({ title: error.msg });
      }
    );
  },
  setTime: function (e) {
    let time='';
    if(e.currentTarget) {
      time = e.currentTarget.dataset.time;
    }else{
      time = e;
    }
    let year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
      day = new Date().getDate();
    switch (time) {
      case "today":
        this.setData({
          time: time,
          start: new Date(Date.parse(year + "/" + month + "/" + day)).getTime() / 1000,
          stop: new Date(Date.parse(year + "/" + month + "/" + day)).getTime() / 1000 + 24 * 60 * 60 -1,
          title: "今日"
        });
        this.getIndex();
        this.setData({ loadend: false, page: 1, dataList: [] });
        this.getList();
        break;
      case "yesterday":
        this.setData({
          time: time,
          start: new Date(Date.parse(year + "/" + month + "/" + day)).getTime() / 1000 - 24 * 60 * 60,
          stop: new Date(Date.parse(year + "/" + month + "/" + day)).getTime() / 1000 - 1,
          title: "昨日"
        });
        this.getIndex();
        this.setData({ loadend: false, page: 1, dataList: [] });
        this.getList();
        break;
      case "month":
        this.setData({
          time: time,
          start: new Date(year, new Date().getMonth(), 1).getTime() / 1000,
          stop: new Date(year, month, 1).getTime() / 1000 - 1,
          title: "本月"
        });
        this.getIndex();
        this.setData({ loadend: false, page: 1, dataList: [] });
        this.getList();
        break;
      case "seven":
        this.setData({
          time: time,
          start: new Date(Date.parse(year + "/" + month + "/" + day)).getTime() / 1000 + 24 * 60 * 60 - 7 * 3600 * 24,
          stop: new Date(Date.parse(year + "/" + month + "/" + day)).getTime() / 1000 + 24 * 60 * 60 - 1,
          title: "七日"
        });
        this.getIndex();
        this.setData({ loadend: false, page: 1, dataList: [] });
        this.getList();
        break;
    }
  },
     /**
   * 获取详细数据
  */
  getList: function (){
    if(this.data.loadend) return;
    if(this.data.loading) return;
    this.setData({ loading: true, loadTitle:""});
    getStatisticsMonth({
      page: this.data.page,
      limit: this.data.limit,
      start: this.data.start,
      stop: this.data.stop
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
  let pages = getCurrentPages();
  let currPage = pages[pages.length - 1]; //当前页面
  if (currPage.data.start && currPage.data.stop) {
    this.setData({
      start: currPage.data.start,
      stop: currPage.data.stop,
      title: "",
      time: 'date'
    });
    this.getIndex();
  }
},
 /**
 * 页面上拉触底事件的处理函数
 */
onReachBottom: function () {
  this.getList();
},
})
