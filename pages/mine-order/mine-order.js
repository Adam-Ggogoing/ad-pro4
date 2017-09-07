// mine-order.js
var ajax = require('../../utils/ajax.js')
var { gotoLogin, parseDate } = require('../../utils/util.js')
var token = require('../../utils/token.js')
var getUser=require('../../utils/getUser.js')
var pay = require('../../utils/pay.js')
var util = require('../../utils/util.js')

Page({
  data: {
    orderList:[],
    selected:1,
    uid:null,
    hadAllorder:false,
    pagenum:2
  },
  parseTime(list){
    var now=Date.parse(new Date())-30*60*1000
    for(var i=0;i<list.length;i++){
      if (list[i].timeOff == undefined){  
        if (list[i].gmtCreate<now){
          list[i].timeOff=false
        }else{
          list[i].timeOff = true
        }
      }
      list[i].gmtCreate = parseDate(list[i].gmtCreate)
    }
    return list
  },
  navSelect:function(e){
    this.getOrderInfo(e.currentTarget.id)
    this.setData({
      selected:e.currentTarget.id,
      orderList: [],      
    })
    wx.showLoading({
      title: 'loading',
    })
  },
  gotoGoodsInfo: function (e) {
    var id = e.currentTarget.id
    wx.navigateTo({
      url: `../goods-info/goods-info?itemId=${id}`,
    })
  },
  getOrderInfo(selectedId){
    var status='0';
    switch (parseInt(selectedId)) {
      case 1: status = '0'; break;
      case 2: status = '2'; break;
      case 3: status = '3,4,5'; break;
      case 4: status = '6'; break;
      case 5: status = '8,9,10,11'; break;
      default:'';break;
    }
    var that = this
    var { uid } = this.data
    if (!uid) {
      return
    }
    ajax({
      url:'/order/getOrders.json',
      method:'post',
      domain:'trade',
      data: {
        uid: uid,
        pageSize: 5,
        curPage: 1,
        status: status
      },
      success:function(result){
        if(result.success){
          if(result.data){
            var data=result.data.objects
            var orderList=that.toFixed(that.parseTime(data))
          }else{
            var orderList=[]
          }
          wx.hideLoading()
          that.setData({
            orderList: orderList
          })
        }
      }
    })
  },
  toFixed(data){
    var dataList=data.map(list=>{
      var items=list.items.map(item=>{
        var price=(item.price*item.count).toFixed(2)
        item.price=price
        if (parseFloat(item.price) <= parseFloat(item.effeAmount)){
          item.price=null
        }
        return item
      })
      list.items=items
      return list
    })
    return dataList
  },
  gotoPayoff: function (e) {
    /*等待支付功能*/
    var oid = e.currentTarget.dataset.id
    pay(oid,(result,res)=>{
      if(result){
        wx.redirectTo({
          url: `../pay-suc/pay-suc?id=${oid}`,
        })
      }else{
        util.error(res)
      }
    })
  },
  gotopayCancel: function (e) {
    var that=this
    ajax({
      url: '/order/cancelTrade.json',
      method: 'post',
      domain: 'trade',
      data: {
        oid:e.currentTarget.id
      },
      success:function(result){
        if(result.success){
          wx.showToast({
            title: '取消成功',
          })
          that.getOrderInfo(that.data.selected);
        }else{
          wx.showToast({
            title: result.errorMsg,
          })
        }
      }
    })
  },
  onLoad: function (options) {
    getUser(token.get(), data => {
      this.setData({ uid: data.userId })
      this.getOrderInfo(1);
    })
  },
  onReachBottom: function () {
    var status = '0';
    switch (parseInt(this.data.selectedId)) {
      case 1: status = '0'; break;
      case 2: status = '2'; break;
      case 3: status = '3,4,5'; break;
      case 4: status = '6'; break;
      case 5: status = '8,9,10,11'; break;
      default: ''; break;
    }
    var { uid } = this.data
    if (!uid) {
      return gotoLogin()
    }
    if(this.data.hadAllorder){
      wx.showToast({
        title: '没有更多数据了',
        duration: 500,
      })
      return ''
    }
    ajax({
      url: '/order/getOrders.json',
      method: 'post',
      domain: 'trade',
      data: {
        uid: uid,
        pageSize: 5,
        curPage: this.data.pagenum,
        status: status
      },
      success: (result)=> {
        if (result.success) {
          var data = result.data
          if (data) {
            if (data.pagination.totalPage == data.pagination.currentPage){
              this.setData({
                hadAllorder:true
              })
              return ''
            }
            var objects = data.objects
            objects = this.data.orderList.concat(objects)
            var orderList = this.toFixed(this.parseTime(objects))
          } else {
            var orderList = []
          }
          this.setData({
            orderList,
            pagenum: data.pagination.currentPage+1,
            hadAllorder:false
          })
        }
      }
    })

  }
})