var promise = require('../../utils/promise.js')
var util = require('../../utils/util.js')
var token = require('../../utils/token.js')

module.exports = {
  interval:null,
  clearInterval(){
    if(this.interval){
      clearInterval(this.interval)
    }
  },
  countdown() {
    var {list} = this.data

    var oneDay = 24 * 60 * 60 * 1000
    var local = (new Date()).getTime()
    var stamp = (num) => num >= 10 ? num : '0' + num;

    this.interval=setInterval(() => {
      list.forEach(item=>{
        if(item.stepType==15){
          if (item.time&&item.time.end>local){
            var d = parseInt(item.time.end) - local
            item.time.hours = stamp(parseInt(d / (60 * 60 * 1000)))
            item.time.minutes = stamp(parseInt(d % (60 * 60 * 1000) / (60 * 1000)))
            item.time.seconds = stamp(parseInt(d % (60 * 1000) / 1000))
          }else{
            item.time.hours = 0
            item.time.minutes = 0
            item.time.seconds = 0
          }
        }
      })
      local = local + 1000
      this.setData({list})
    }, 1000)
  },
  bindViewTap: function (e) {
    var id = e.currentTarget.id
    if (id == 0) {
      return ''
    }
    wx.navigateTo({
      url: `${id}`,
    })
  },
  gotoGoodsInfo: function (e) {
    var id = e.currentTarget.id
    wx.navigateTo({
      url: `../goods-info/goods-info?itemId=${id}`
    })
  },
  gotoindex: function (e) {
    var id = e.currentTarget.id
    if (id == 0) { return '' }
    wx.navigateTo({
      url: `../index-activity/index-activity?pageId=${id}`,
    })
  },
  appendItem: function (e) {
    var { userId } = this.data
    if (!userId) {
      return util.gotoLogin()
    }
    var { skuid, itemid } = e.currentTarget.dataset
    promise.appendItem({ uid: userId, skuId: skuid, itemId: itemid, itemCount: 1 }, result => {
      util.msg('添加商品成功')
      this.setData({ count: this.data.count + 1 })
    })
  }
}