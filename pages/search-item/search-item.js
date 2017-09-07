var ajax = require('../../utils/ajax.js')
var pageSize = 10
var util = require('../../utils/util.js')
var token = require('../../utils/token.js')
var getUser = require('../../utils/getUser.js')
var promise = require('../../utils/promise.js')

var query = ({itemKeyWord,pageNum=0,pageSize=10}, cb) => ajax({
  url: '/search/queryitems',
  method: 'get',
  data: {
    itemKeyWord,pageNum,pageSize
  },
  success(result) {
    if (result.success) {
      cb&&cb(result.module)
    }
  }
}) ;

var loading = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword:'',
    pageNum:0,
    itemCount:0,
    items:[],
    userId:null,
    count:null,
  },
  initSearch(itemKeyWord){
    if (!itemKeyWord){
      return util.error('请输入搜索词')
    }
    this.setData({
      keyword:itemKeyWord,
      items:[],
      itemCount:0,
      pageNum:0
    })
    query({ itemKeyWord }, result => {
      this.setData({
        items: result.items,
        itemCount: result.itemCount,
        pageNum:0,
        itemKeyWord
      })
    })
  },
  inputSearch(e){
    this.initSearch(e.detail.value)
  },

  getUserId(){
    var tokenValue = token.get()
    if(tokenValue){
      getUser(tokenValue,result=>{
        this.setData({ userId: result.userId })
        promise.getCartCount(result.userId,res=>{
          this.setData({count:res})
        })
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initSearch(options.word)
    this.getUserId()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  // 下拉刷新
  onReachBottom(){
    var { pageNum, itemCount, items, keyword } = this.data
    if(items.length>=itemCount){
      return 
    }
    if(loading){
      return
    }
    loading = true
    query({ itemKeyWord: keyword, pageNum: pageNum+1},result=>{
      var {items} = this.data
      loading = false
      this.setData({
        items: items.concat(result.items),
        pageNum:pageNum+1
      })
    })
  },
  addPit1ToCart(e){
    var {userId} = this.data
    if(!userId){
      return util.gotoLogin()
    }
    var { skuid, itemid } = e.currentTarget.dataset
    promise.appendItem({uid:userId,skuId:skuid,itemId:itemid,itemCount:1},result=>{
      util.msg('添加商品成功')
      this.setData({count:this.data.count+1})
    })
  }

})
