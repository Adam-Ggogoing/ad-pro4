//index.js
//获取应用实例
var app = getApp()
var ajax = require('../../utils/ajax_v2.js')
var token = require('../../utils/token.js')
var getUser = require('../../utils/getUser.js')
var util = require('../../utils/util.js')
var promise = require('../../utils/promise.js')
var floorsObj = require('../../component/floors/floors.js')
var config = require('../../utils/config.js')

Page(Object.assign({}, floorsObj, {
  data: {
    list: [],
    isIndex: true,
    timeEnd: null,
    searchValue: null,
    dTime: null
  },
  search: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
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
  gotoSearch: function () {
    wx.navigateTo({
      url: `../search-item/search-item?word=${this.data.searchValue || '三文鱼'}`,
    })
  },
  onPullDownRefresh(){
    this.onLoad()
  },
  onShow: function () {
    this.getUserId()
  },
  onLoad: function () {
    wx.showLoading({
      title: 'loading',
    })
    ajax({
      url: '/requesthome/home',
      method: 'post',
      data: {
        pageId: config.pageId,
        pageNum:0,
        pageSize:1000
      },
      success: e => {
        if (e.success) {
          var list = e.module
          wx.hideLoading()
          this.setData({
            list: list         
          })
          this.clearInterval()
          this.countdown()
          wx.stopPullDownRefresh()
        }
      }
    })
  }
}))
