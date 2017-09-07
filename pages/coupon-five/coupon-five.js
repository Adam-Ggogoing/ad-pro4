// coupon-five.js
var ajax=require('../../utils/ajax_v2.js')
var token = require('../../utils/token.js')
var { gotoLogin } = require('../../utils/util.js')
const key = 'c6a497c82b55d39f3e7671121db86e35', type = 1

Page({
  data: {},
  getcoupon: function () {
    var tokenValue = token.get()
    if (!tokenValue) {
      return gotoLogin()
    }
    var promise = ajax({
      url: '/promotion/sendDiscountCoupon',
      method: 'post',
      data: {
        key,
        token: token.get()
      },
      success(result) {
        if (result.success) {
          var repeatText = '已拥有优惠券，无需领取'
          if (result.errorMsg.indexOf(repeatText) > -1) {
            return wx.showToast({
              title: repeatText,
            })
          }
          return wx.showToast({
            title: '新人优惠价领取成功'
          })
        }
      }
    })
  },
  onLoad: function (options) {}
})