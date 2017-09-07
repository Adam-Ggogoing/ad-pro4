var ajax = require('../../utils/ajax.js')
var token = require('../../utils/token.js')
var { gotoLogin, parseDay} = require('../../utils/util.js')

var {eventHub} = getApp()

Page({
  data:{
    list:[],
    selectedId:1,
    hadInput:false,
    searchValue:null,
    pagenum:0,
    hadAllCou:false
  },

  tabSelect:function(e){
    var id=e.currentTarget.id
    this.setData({
      list: [],
      selectedId:id
    })
    wx.showLoading({
      title: 'loading',
    })
    this.couponsInfo()
  },
  openText:function(e){
    var id=e.currentTarget.id
    var list = this.data.list
    for (var i = 0; i < list.length; i++) {
      if ( list[i].id==id ) {
        list[i].openTextFlag = !list[i].openTextFlag
      }
    }
    this.setData({
      list:list
    })
  },
  search:function(e){
    if(e.detail.value!=''){
      this.setData({
        hadInput:true,
        searchValue: e.detail.value
      })
    }else{
      this.setData({
        hadInput: false
      })
    }
  },
  getNewcoupon:function(){
    var key = this.data.searchValue
    if (!key)return ''
    ajax({
      url: '/promotion/exchangeusercoupon',
      data: {
        key: key,
        token: token.get()
      },
      success: e => {
        if (e.success) {
          wx.showToast({
            title: '领取成功',
          })
        }
      }
    })
  },
  couponsInfoResultHandle(list){
    var data = list.map((item, index) => {
      switch (item.couponType) {
        case 11: item.couponClass = 'all-coupon-body'; break;
        case 12: item.couponClass = 'limit-coupon-body'; break;
        default: item.couponClass = 'other-coupon-body'; break;
      }
      item.couponStartTime = parseDay(item.couponStartTime)
      item.couponEndTime = parseDay(item.couponEndTime)
      if (item.description) {
        item.overRule = true
        item.openTextFlag = false
      } else {
        item.overRule = false
        item.openTextFlag = true
      }
      return item
    })
    wx.hideLoading()
    this.setData({
      pagenum: this.data.pagenum + 1,
      list: data,
      hadAllCoup:false
    })
  },
  couponsInfo(){
    var tokenValue = token.get()
    if (!tokenValue) {
      return gotoLogin()
    }
    this.setData({
      pagenum:0
    })
    ajax({
      url: '/promotion/selectUserCouponDetailList',
      method: 'post',
      data: {
        version: 1,
        src: "wxApplication",
        appversion: '1',
        data: {
          token: tokenValue,
          "type":this.data.selectedId - 1+'',
          pagesize: 5,
          pagenum: 0
        }
      },
      success: (result) => {
        if (result.success) {
          var data=result.module
          if(data){
            this.couponsInfoResultHandle(data.list)
          }
        }
      }
    })
  },
  onLoad(){
    this.couponsInfo()
  },
  onReachBottom: function () {
    var tokenValue = token.get()
    if (!tokenValue) {
      return gotoLogin()
    }
    if(this.data.hadAllCoup){
      wx.showToast({
        title: '没有更多数据了',
        duration: 500
      })
      return ''
    }
    ajax({
      url: '/promotion/selectUserCouponDetailList',
      method: 'post',
      data: {
        version: 1,
        src: "wxApplication",
        appversion: '1',
        data: {
          token: tokenValue,
          "type": this.data.selectedId - 1 + '',
          pagesize: 5,
          pagenum: this.data.pagenum
        }
      },
      success: (result) => {
        if (result.success) {
          var data = result.module
          if (data) {
            if(data.list.length<1){
              this.setData({hadAllCoup:true})
            }else{
              var list=this.data.list.concat(data.list)
              this.couponsInfoResultHandle(list)
            }
          }
        }
      }
    })
  }
})