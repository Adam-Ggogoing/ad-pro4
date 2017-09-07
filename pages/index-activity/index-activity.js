// pages/index-activity/index-activity.js
var floorsObj = require('../../component/floors/floors.js')
var req = require('../../utils/ajax_v2.js')
var promise = require('../../utils/promise.js')
var token = require('../../utils/token.js')
var getUser = require('../../utils/getUser.js')

Page(Object.assign({}, floorsObj,{
  data:{
    list:[],
    userId:null
  },
  getUserId() {
    var tokenValue = token.get()
    if (tokenValue) {
      getUser(tokenValue, result => {
        if (!result) {
          return
        }
        this.setData({ userId: result.userId })
      })
    }
  },
  onLoad(options){
    wx.showLoading({
      title: 'loading',
    })
    var pageId = options.pageId
    if (pageId > 0 && pageId != 303) {
      var isIndex = false
    } else { var isIndex = true }
    req({
      url: '/requesthome/home',
      method: 'post',
      data: {
        pageId: pageId
      },
      success: e => {
        if (e.success) {
          var list = e.module
          wx.hideLoading()
          this.setData({
            list         
          })
        }
      }
    })
    this.getUserId()
  }
}))
