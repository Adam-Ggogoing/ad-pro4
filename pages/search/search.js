// pages/search/search.js
var util = require('../../utils/util.js')
var ajax = require('../../utils/ajax.js')
var historyStore = {
  key:'searchWord',
  get(){
    return wx.getStorageSync(this.key)||[]
  },
  set(word){
    var list = this.get()  
    if (word && list.indexOf(word)===-1){
      list.push(word)
      wx.setStorageSync(this.key, list)
    }
    return list
  },
  clear(){
    var empty = []
    wx.setStorageSync(this.key, empty)
    return empty
  }
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotWords: [],
    history:[]
  },
  goBack(){
    wx.navigateBack()
  },
  searchWord(word){
    if(!word||word.length===0){
      return util.error('请输入搜索词')
    }
    this.setData({history:historyStore.set(word)})
    wx.navigateTo({
      url: `../search-item/search-item?word=${word}`,
    })
  },
  clearHistory(){
    this.setData({ history: historyStore.clear()})
  },
  inputSearch(e){
    this.searchWord(e.detail.value)
  },
  gotoSearch(e){
    this.searchWord(e.currentTarget.dataset.item)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取热词
    ajax({
      url:"/search/hotsearchword",
      method:"post",
      success:result=>{
        if(result.success){
          this.setData({hotWords:result.module})
        }
      }
    })

    this.setData({
      history: historyStore.get()
    })

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  }

})