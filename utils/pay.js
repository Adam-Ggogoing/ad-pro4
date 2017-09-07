var token = require('./token.js')
var util = require('./util.js')
var ajax = require('./ajax_v2.js')

module.exports = (oid,cb)=>{
  var callback = (result, res) => typeof (cb) === 'function' && cb(result, res) 
  if(!token.get()){
    return callback(false,'请先登录')
  }
  
  wx.login({
    success: res => {
      if (res.code) {
        ajax({
          url: '/order/getWeixinXiaoChengXuPaySign.json',
          method: 'post',
          domain: 'trade',
          data: {
            code: res.code,
            oid:oid+'',
            token: token.get()
          },
          success(result) {
            if (result.success) {
              var {
                timestamp, sign, prepayid,
                partnerid, pack,
                noncestr, appid
              } = result.data
              wx.requestPayment({
                'timeStamp': timestamp + '',
                'nonceStr': noncestr,
                'package': pack,
                'signType': 'MD5',
                'paySign': sign,
                'success': function (res) {
                  callback(true,res)
                },
                'fail': function (res) {
                  callback(false, '支付失败，请进入我的订单进行支付')
                }
              })
            }
          }
        })
      } else {
        callback('登录失败，请重试')
      }
    }
  })
}