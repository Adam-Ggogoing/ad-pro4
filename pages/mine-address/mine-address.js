var ajax = require('../../utils/ajax.js')
var token = require('../../utils/token.js')
var getUser = require('../../utils/getUser.js')

var hub = getApp().eventHub

Page({
  data:{
    addressList:[],
    uid:null,
    ref:null
  },

  getAllAddress(){
    var {uid} = this.data
    if(!uid){
      return
    }
    ajax({
      url: "/da/queryAllAddress.json",
      method:'post',
      domain:'trade',
      data:{
        uid
      },
      success:data=>{
        if(data.success){
          this.setData({ addressList: data.data})
        }
      }
    })
  },

  gotoForm(e){
    var { address} = e.currentTarget.dataset
    var { ref } = this.data
    
    if(ref){
      hub.emit('setDefaultAddress',address)
      wx.navigateBack()
      return
    }

    var {uid} = this.data
    wx.navigateTo({
      url: `../mine-address-form/mine-address-form?id=${address.id}&uid=${uid}`,
    })
  },
  addAddress(e){
    var { uid } = this.data
    wx.navigateTo({
      url: `../mine-address-form/mine-address-form?uid=${uid}`,
    })
  },
  onLoad(options){
    getUser(token.get(),data=>{
      this.setData({ uid: data.userId })
      this.getAllAddress()
    })

    hub.add('refreshAddress',()=>{
      this.getAllAddress()
    })

    this.setData({ ref: options.ref||null})
    

  },
  onUnload(){
    hub.remove('refreshAddress')
  }
})