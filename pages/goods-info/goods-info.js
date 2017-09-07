// goods-info.js
var ajax = require('../../utils/ajax.js')
var getUser=require('../../utils/getUser.js')
var token=require('../../utils/token.js')
var util = require('../../utils/util.js')
var promise = require('../../utils/promise.js')
Page({
  data: {
    data:{},
    recommand:{},
    goodsCount:1,
    uid:null,
    count:null,
    detailList:[],
    options:null,
    hadShowDetail:false
  },
  getUserId() {
    var tokenValue = token.get()
    if (tokenValue) {
      getUser(tokenValue, result => {
        this.setData({ userId: result.userId })
        promise.getCartCount(result.userId, res => {
          this.setData({ count: res })
        })
      })
    }
  },
  getHpptsPic(data){
    var newData=data.map(function(item){
      item.itemSkuVOs[0].saleDetailInfo = item.itemSkuVOs[0].saleDetailInfo.slice(0,2)
      if(item.picUrl){
        var url=item.picUrl.slice(4)
        if (item.picUrl.slice(0,5)=='http:'){
          item.picUrl="https"+url
        }
      }
      return item
    })
    return newData
  },
  gotoGoodsInfo: function (e) {
    var id = e.currentTarget.id
    wx.redirectTo({
      url: `../goods-info/goods-info?itemId=${id}`,
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
  },
  gotoCart:function(){
    wx.switchTab({
      url: '../cart/cart',
      fail:e=>{
        console.log(e)
      }
    })
  },
  getDetailPic:function(){
    if(this.data.hadShowDetail){
      return ''
    }
    ajax({
      url: '/item/getdetail',
      data: { id: this.data.options.itemId },
      domain: "purchase",
      success: e => {
        var detailList = e.module
        if (e.success) {
          this.setData({
            detailList,
            hadShowDetail:true
          })
        }
      }
    })
  },
  onLoad: function (options) {
    this.getUserId()
    ajax({
      url:'/requestcommodity/itemdetail',
      data: { itemId: options.itemId},
      success:(result)=>{
        if(result.success){
          var data=result.module
          ajax({
            url: '/requestcommodity/recommenditem ',
            method:'post',
            data: { "data": options.itemId, "appversion": "19", "src": "wxApplication", "version": 1 },
            success:  (e)=> {
              if (e.success) {
                var recommand=this.getHpptsPic(e.module)
                this.setData({
                  recommand,
                  data,
                  options
                })
                this.getDetailPic()
              }
            }
          })
        }
      }
    });
  }
})