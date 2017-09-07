// cart.js
var app = getApp()
var ajax = require('../../utils/ajax.js')
var token = require('../../utils/token.js')
var { gotoLogin } = require('../../utils/util.js')
var getUser = require('../../utils/getUser.js')
var util = require('../../utils/util.js')
var promise = require('../../utils/promise.js')
Page({
  data: {
    list:[],
    invalid:[],
    goodsData: null,
    allSelected:true,
    count:null
  },
  onPullDownRefresh() {
    this.onLoad()
  },
  getCount() {
    var tokenValue = token.get()
    if (tokenValue) {
      getUser(tokenValue, result => {
        if (!result) {
          return
        }
        this.setData({ userId: result.userId })
        promise.getCartCount(result.userId, res => {
          this.setData({ count: res })
        })
      })
    }
  },
  changeCartCount:function(item,checkList,count,list){
    ajax({
      url: '/sc/changeCartCount.json',
      method: 'POST',
      domain: 'trade',
      data: { 
        token: token.get(),
        itemId:item.id,
        skuId: item.skuId,
        checkList: checkList,
        itemCount:count
      },
      success: (result) => {
        if (result.success) {
          // this.getItemInfo()
          var num = 0
          for (var i = 0; i < list.length; i++) {
            if (list[i].selected == false) {
              num++
            }
          }
          var allSelected = num < 1 ? true : false;
          this.setData({ allSelected })
          this.getCount()
          this.setData({
           list:list,
           goodsData: result.data
          })
        }
      }
    })
  },
  clearInvalidGoods:function(){
    ajax({
      url: '/ sc / cleanInvalidItem.json',
      method: 'POST',
      domain: 'trade',
      header: { 'content-type': 'application/json;charset=UTF-8'},
      data: { 
        "version": 1, 
        "src": "wxApplication", 
        "data":token.get() ,
        "appversion": "1" 
      },
      success: (result) => {
        if (result.success) {
          this.getItemInfo()
          wx.showToast({
            title: result.message,
          })
        }
      }
    })
  },
  del:function(e){
    var that = this
    var list = Object.assign([], this.data.list)
    for (var i = 0; i < list.length; i++) {
      if (list[i].id == e.currentTarget.id) {
        var item = list[i]
        list.splice(i, 1)
      }
    }
    var count=0;
    var checkList = JSON.stringify(list.map(function (item) { return item.skuId }))
    wx.showModal({
      title: '删除确认',
      content: '确认删除该商品？',
      success:function(res){
        if(res.confirm){
          that.changeCartCount(item,checkList,count,list)
        }
      }
    })
  },
  changeCount: function (e,isAdd) {
    var list = Object.assign([], this.data.list)
    for (var i = 0; i < list.length; i++) {
      if (list[i].id == e.currentTarget.id) {
        var item = list[i]
        var count = isAdd ? parseInt(item.itemCount) + 1:item.itemCount - 1;
        if(count<1){return ''}
        list[i].itemCount = count
      }
    }
    var checkList = JSON.stringify(list.map(function (item) {if(item.selected){return item.skuId} }))
    this.changeCartCount(item, checkList, count, list)
  },
  changeCountL: function (e) {
    var isAdd = false;
    this.changeCount(e, isAdd)
  },
  changeCountR: function (e) {
    var isAdd=true;
    this.changeCount(e, isAdd)
  },
  selectRequest: function (item, checkList,list) {
    var num=0
    for(var i=0;i<list.length;i++){
      if(list[i].selected==false){
        num++
      }
    }
    var allSelected=num<1?true:false;
    if (item){
      ajax({
        url: '/sc/select.json',
        method: 'POST',
        domain: 'trade',
        data: {
          token: token.get(),
          skuId: item.skuId,
          checkList: checkList
        },
        success: (result) => {
          if (result.success) {
            this.setData({
              goodsData: result.data,
              list:list,
              allSelected: allSelected
            })
          }
        }
      })
    } else {
      ajax({
        url: '/sc/select.json',
        method: 'POST',
        domain: 'trade',
        data: {
          token: token.get(),
          checkList: checkList
        },
        success: (result) => {
          if (result.success) {
            this.setData({
              goodsData: result.data,
              list: list,
              allSelected: allSelected
            })
          }
        }
      })
    }
  },
  getCheckList(e){
    var list = Object.assign([], this.data.list)
    for (var i = 0; i < list.length; i++) {
      if (!list[i].selected) {
        if (list[i].id == e.currentTarget.id) {
          list.splice(i, 1);
        }
      }
    }
    return JSON.stringify(list.map(function (item, i) { if (list[i].selected) { return item.skuId } }))
  },
  select: function (e) {
    var list = Object.assign([], this.data.list)
    for (var i = 0; i < list.length; i++) {
      if (list[i].id == e.currentTarget.id) {
        var item = list[i]
        list[i].selected = !list[i].selected
      }
    }
    var checkList = this.getCheckList(e)
    this.selectRequest(item, checkList, list)
  },
  allSelect: function () {
    var list = Object.assign([], this.data.list)
    var checkList = list.map(function (item) { return item.skuId })
    var allSelected = !this.data.allSelected
    var item = null
    if (!allSelected) { 
      checkList = [];
      list=this.setFlag(list,false)
    }else{
      list = this.setFlag(list, true)
    }
    checkList = JSON.stringify(checkList)
    this.selectRequest(item, checkList,list)
  },
  gotoHome: function () {
    wx.switchTab({
      url: '../index/index',
    })
  },
  gotoPayoff: function () {
    var tokenValue = token.get()
    if (!tokenValue) {
      return ''
    }
    var {list} = this.data
    var selectedList=[]
    for(let i=0;i<list.length;i++){
      if(list[i].selected){
        selectedList.push(list[i])
      }
    }
    var skuIds = selectedList.map(sku => sku.skuId)
    var sciId = selectedList.map(sku=>sku.id)
    if (selectedList.length<1) return '';
    return wx.navigateTo({
      url: `../account/account?skuId=${skuIds.join(',')}&&sciId=${sciId.join(',')}`
    })
  },
  setFlag(list,flag){
    for (var i = 0; i < list.length; i++) {
      list[i].selected = flag
    }
    return list
  },
  getItemDetails(obj){
    var skuIds=obj.goodsList.map(item=>{
      return item.skuId
    })
    this.setData({
      goodsData: obj.goodsData,
      invalid: obj.invalid,
      count: obj.count
    })
    // skuIds=JSON.stringify(skuIds)
    // skuIds = skuIds.slice(1,-1)
    if(skuIds.length===0){
      return
    }
    ajax({
      url: '/requestcommodies/queryitemtagsdetail',
      data: { skuIds:skuIds.join(',')},
      success: (result) => {
        if (result.success) {
          obj.goodsList.map((item,index)=>{
            item.tagdetail=result.module[index]
            item.itemCount = parseInt(item.itemCount)
          })
          this.setData({     
            list: obj.goodsList  
          })
        }
      }
    })
    
  },
  getItemInfo(){
    ajax({
      url: '/sc/getCarts.json',
      method: 'POST',
      domain: 'trade',
      data: { token: token.get() },
      success: (result) => {
        wx.stopPullDownRefresh()
        if (result.success) {
          if (!result.data) {
            this.setData({
              count:0,
              list:[],
              invalid:[]
            })
            return ''
          }
          var list = result.data.objects
          var goodsData=result.data
          var valid=[]
          var invalid=[]
          for(var i=0;i<list.length;i++){
            if(list[i].invalid){
              invalid.push(list[i])
            }else{
              valid.push(list[i])
            }
          }
          var goodsList = this.setFlag(valid, true)
          var count = 0
          list.map(item => {
            count += parseInt(item.itemCount)
          })
          var obj = { count, goodsData, goodsList,invalid}
          this.getItemDetails(obj)
        } else { 
          //wx.clearStorageSync() 
        }
      }
    })
  },
  onShow: function () {
    var tokenValue = token.get()
    if (!tokenValue) {
      return ''
    }
    this.getItemInfo()
    this.setData({allSelected: true})
  },
  onLoad: function (options) {
  },
})