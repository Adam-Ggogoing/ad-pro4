var util = require('../../utils/util.js')
var ajax = require('../../utils/ajax_v2.js')
var token = require('../../utils/token.js')

// pages/pay/pay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 16232  options.orderId
    wx.login({
      success:res=>{
        if(res.code){
          ajax({
            url:'/order/getWeixinXiaoChengXuPaySign.json',
            method:'post',
            domain:'trade',
            data:{
              code:res.code,
              oid: options.orderId,
              token:token.get()
            },
            success(result){
              if(result.success){
                var { 
                  timestamp, sign, prepayid, 
                  partnerid, pack,
                  noncestr, appid
                } = result.data
                wx.requestPayment({
                  'timeStamp': timestamp+'',
                  'nonceStr': noncestr,
                  'package': pack,
                  'signType': 'MD5',
                  'paySign': sign,
                  'success': function (res) {
                    wx.redirectTo({
                      url: `../pay-suc/pay-suc?id=${options.orderId}`,
                    })
                  },
                  'fail': function (res) {
                    util.error('支付失败，请进入我的订单进行支付')
                  }
                })
              }
            }
          })
        }else{
          util.error('登录失败，请重试')
        }
      }
    })
  }
})