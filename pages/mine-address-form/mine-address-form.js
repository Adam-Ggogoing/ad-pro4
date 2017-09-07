var token = require('../../utils/token.js')
var ajax = require('../../utils/ajax_v2.js')
var util = require('../../utils/util.js')
var req = require('../../utils/ajax.js')

var {eventHub} = getApp()

var getAddress = (uid,id,cb)=>{
  return req({
    url: "/da/queryAllAddress.json",
    method: 'post',
    domain: 'trade',
    data: {
      uid
    },
    success: data => {
      if (data.success) {
        cb((data.data||[]).filter(item=>item.id==id)[0])
      }
    }
  })
}

var closePanel = (text)=>{
  util.msg(text)
  eventHub.emit('refreshAddress')
  wx.navigateBack()
}

var delAddress = (uid,id)=>{
  return req({
    url:'/da/delLinkman.json',
    method:'post',
    domain:'trade',
    data:{uid,id},
    success(result){
      if(result.success){
        closePanel('地址删除成功')
      }
    }
  })
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id:null,
    name:'',
    address:'',
    addressDetail:'',
    longitude:'',
    latitude:'',
    phone:'',
    provinceName:'',
    cityName:'',
    adName:'',
    uid:null,
    isHomeAddress:true
  },
  submit(){
    var { 
      id, name, address, addressDetail, 
      longitude, latitude, phone, isHomeAddress,
      provinceName, cityName, adName, codeAddress
    } = this.data
    if(name===''){
      return util.error('请填写联系人')
    }
    if(phone===''){
      return util.error('请填写手机号')
    }
    if(phone.length!==11){
      return util.error('手机号必须为11位')
    }
    if(addressDetail===''){
      return util.error('请填写地址具体信息')
    }
    if (address === '' || longitude === '' || latitude===''){
      return util.error('请选择收货地址')
    }
    if(!id){
      ajax({
        url:'/da/addAddress.json',
        domain:'trade',
        method:'post',
        data:{
          name, phone, address:addressDetail, addressDetail:'', 
          codeAddress: address,longitude, latitude, 
          isHomeAddress,provinceName,cityName,adName,
          token:token.get(),
          defaultAddress:false,
          freshAddress:false,
          code:310000
        },
        success(result){
          if(result.success){
            closePanel('地址添加成功')  
          }else{
            util.error('该地址不在配送范围内')
          }
        }
      })
    }else{
      ajax({
        url:'/da/updateAddress.json',
        domain: 'trade',
        method: 'post',
        data: {
          name, phone, address: addressDetail, addressDetail:'',
          codeAddress: address,longitude, latitude,id,
          isHomeAddress, provinceName, cityName, adName,
          token: token.get(),
          defaultAddress: false,
          freshAddress: false,
          code: 310000
        },
        success(result) {
          if (result.success) {
            closePanel('地址修改成功')
          } else {
            util.error('该地址不在配送范围内')
          }
        }
      })
    }
  },
  del(){
    var {id,uid} = this.data
    wx.showModal({
      title:"收货地址",
      content:'确定删除该地址吗',
      success(res){
        if(res.confirm){
          delAddress(uid,id)
        }
      }
    })
  },
  
  choseLocation(){
    wx.chooseLocation({
      success: res => {
        var { address, name, latitude, longitude } = res

        this.setData({
          address: name,
          codeAddress: address,
          latitude: latitude,
          longitude: longitude
        })
      }
    })
  },
  changeName(e){
    this.setData({name:e.detail.value})
  },

  changeAddressDetail(e){
    this.setData({addressDetail:e.detail.value})
  },

  changePhone(e){
    this.setData({phone:e.detail.value})
  },
  setHomeAddress(){
    this.setData({isHomeAddress:true})
  },
  setCompanyAddress(){
    this.setData({ isHomeAddress: false })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var {id,uid} = options
    // 地址回填  
    if(id){
      this.setData({ id })
      getAddress(parseInt(uid),id,(detail)=>{
        var { 
          id,name,address,addressDetail,
          longitude,latitude,phone,
          isHomeAddress,codeAddress
        } = detail

        this.setData({
          id, name, address, addressDetail,
          longitude, latitude, phone:phone+'',
          isHomeAddress,uid
        })
      
      })
    }

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  }
})