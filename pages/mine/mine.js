var ajax = require('../../utils/ajax.js')
var token = require('../../utils/token.js')
var getUser = require('../../utils/getUser.js')
var { gotoLogin } = require('../../utils/util.js')
var util = require('../../utils/util.js')
var promise = require('../../utils/promise.js')

Page({
  data:{
    user:null,
    count:null
  },
  onPullDownRefresh() {
    this.onLoad()
  },
  login(){
    return gotoLogin()
  },
  gotoCoupon() {
    var tokenValue = token.get()

    if (tokenValue) {
      return wx.navigateTo({
        url: '/pages/mine-coupon/mine-coupon'
      })
    }else{
      wx.showToast({
        title: '请先登录'
      })
    }
  },
  getUserId() {
    var tokenValue = token.get()
    if (tokenValue) {
      getUser(tokenValue, result => {
        if(!result){
          return util.gotoLogin()
        }
        this.setData({ userId: result.userId })
        promise.getCartCount(result.userId, res => {
          this.setData({ count: res })
        })
      })
    }
  },
  gotoAddress(){
    var tokenValue = token.get()
    if(tokenValue){
      return wx.navigateTo({
        url: '/pages/mine-address/mine-address'
      })
    }else{
      wx.showToast({
        title: '请先登录'
      })
    }
  },
  gotoOrder() {
    var tokenValue = token.get()
    if (tokenValue) {
      return wx.navigateTo({
        url: '/pages/mine-order/mine-order'
      })
    } else {
      wx.showToast({
        title: '请先登录'
      })
    }
  },
  onLoad() {
    this.getUserId()
    var tokenValue = token.get()
    if(tokenValue){
      ajax({
        url:'/requestuser/mine',
        method:'post',  
        data:{
          token:tokenValue
        },
        ignoreLogin:true,
        success:(result)=>{
          wx.stopPullDownRefresh()
          if(result.success){
            this.setData({
              user:result.module
            })
          }else{
            utill.error(result.message)
          }
        }
      })
    }
  }
})