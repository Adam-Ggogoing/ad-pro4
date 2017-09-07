var ajax = require('../../utils/ajax.js')
var token = require('../../utils/token.js')
var { gotoLogin, parseDate } = require('../../utils/util.js')

var {eventHub} = getApp()

Page({
  data: {
    list: [],
    selectCoupon:true
  },
  selectCoupon(e) {
    var { selectCoupon, list } = this.data
    if (selectCoupon) {
      var coupon = list.filter(item => item.id == e.currentTarget.dataset.item)
      eventHub.emit('setCoupon', coupon[0])
      wx.navigateBack()
    }
  },
  onLoad(params) {
    var tokenValue = token.get()
    if (!tokenValue) {
      return gotoLogin()
    }
    var data = {
      token: tokenValue,
      queryType: 0
    }
    if ('obj' in params) {
      data.queryType = 1
      data.payType = 1
      data.buySkuDetailJson = params['obj']
    }
    ajax({
      url: '/promotion/selectUserCouponList',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data,
      success: (result) => {
        if (result.success) {
          this.setData({
            list: (result.module || []).map(item => {
              item.couponStartTimeStr = parseDate(item.couponStartTime)
              item.couponEndTimeStr = parseDate(item.couponEndTime)
              return item
            })
          })
        }
      }
    })
  }
})