var ajax = require('../../utils/ajax.js')
var req = require('../../utils/ajax_v2.js')
var token = require('../../utils/token.js')
var getUser = require('../../utils/getUser.js')
var util = require('../../utils/util.js')
var {eventHub} = getApp()
var pay = require('../../utils/pay.js')

const dayRange = ['今日', '明日']

var getTotalPrice = (coupon,totalPrice)=>{
  if(!coupon){
    return totalPrice
  }
  var dis = parseFloat(totalPrice) - parseFloat(coupon.amountYuanDescription)
  if(dis<0){
    return '0'
  }
  return dis.toFixed(2)
}

// 获取今日明日时间
var getRangeTime = rangeResult => {
  var handleResult = result => {
    var { start, dayEnd, timeRange, waveRange } = result
    var obj = {}
    var minuteUtil = 1000 * 60
    while (start + waveRange * minuteUtil < dayEnd && start + timeRange * minuteUtil < dayEnd) {
      obj[util.parseTime(start) + '-' + util.parseTime(start + timeRange * minuteUtil)] = util.parseDateStr(start)
      start += waveRange * minuteUtil
    }
    return obj
  }
  return rangeResult.map(handleResult)
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    address:null,
    discountInfos:'',
    objects:[],
    couponList:[],
    description:'',
    currPrice:'0',
    freight:'0',
    totalPrice:'0',
    coupon:null,
    sciId:'',

    rangeTime: [],
    dayValue:0,
    timeValue:0,
    multiArray: [],
    dayRange,

    isSubmit:false
  
  },

  // 获取默认地址
  getDefaultAddress(uid){
    ajax({
      url:'/da/getDefaultAddress.json',
      method:'post',
      domain:'trade',
      data:{uid},
      success:result=>{
        if(result.success){
          this.setData({address:result.data})
        }
      }
    })
  },  

  // 获取结算详情
  settle(options){
    ajax({
      url:'/sc/settle.json',
      method:'post',
      domain:'trade',
      data:{
        token:token.get(),
        skuIds: options.skuId
      },
      success:(result)=>{
        if(result.success){
          var { 
            discountInfos, objects, deliverRangeResult, 
            couponList, currPrice, freight, totalPrice 
          } = result.data
          var rangeTime = getRangeTime(deliverRangeResult)
          var defaultRangeTimeKey = Object.keys(rangeTime[0])

          this.setData({
            rangeTime,
            discountInfos: (discountInfos || []).map(info => info.discountDesc).join(' | '),
            objects,
            couponList, 
            currPrice, 
            freight, 
            totalPrice, 
            totalPriceShow: totalPrice,
            dayValue:0,
            timeValue: defaultRangeTimeKey[0],
            multiArray: [dayRange, defaultRangeTimeKey],
            sciId: options.sciId
          })

        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getUser(token.get(),user=>{
      this.getDefaultAddress(user.userId)    
    })

    // 触发地址选择
    eventHub.add('setDefaultAddress', address=>{
      this.setData({address})
    })

    this.settle(options)

    eventHub.add('setCoupon',coupon=>{
      var {totalPrice} = this.data
      this.setData({
        coupon,
        totalPriceShow: getTotalPrice(coupon,totalPrice)
      })
    })

  },
  selectAddress(){
    wx.navigateTo({
      url: '../mine-address/mine-address?ref=account',
    })
  },
  selectCoupon(){
    var {objects} = this.data
    var tranObject = objects.reduce(($1,$2)=>{
      $1[$2.skuId] = $2.itemCount
      return $1
    },{})
    wx.navigateTo({
      url: `../account-coupon/account-coupon?obj=${JSON.stringify(tranObject)}`,
    })
  },
  bindMultiPickerChange(e){
    var { value} = e.detail
    var {rangeTime} = this.data
    this.setData({
      dayValue:value[0],
      timeValue: Object.keys(rangeTime[value[0]])[value[1]]
    })
  },

  bindDescription(e){
    this.setData({description:e.detail.value})
  },

  bindcolumnchange(e){
    var {detail} = e
    var { column, value} = detail
    var {rangeTime} = this.data
    if (column===0){
      this.setData({
        multiArray:[dayRange,Object.keys(rangeTime[value])]
      })
    }
  },

  submit(e){
    this.setData({isSubmit:true})
    var { 
      address,
      couponList,
      description,
      currPrice,
      freight,
      totalPrice,
      coupon,
      sciId,

      rangeTime,
      dayValue,
      timeValue,
      dayRange
    } = this.data
    
    if(address===null){
      return util.error('请选择送货地址')
    }

    req({
      url:"/sc/createOrder.json",
      domain:'trade',
      method:'post',
      data:{
        token: token.get(), 
        sciId: sciId.split(',').map(id=>parseInt(id)), 
        distribution: rangeTime[dayValue][timeValue],
        credit: 0, adderssId:address.id,
        description, rechargePayAmount:0,
        couponId: coupon ? coupon.id : 0, 
        channelType:4
      },
      success(rl){
        if(rl.success){
          util.refresh()
          pay(rl.data,(result,res)=>{
            if(result){
              wx.redirectTo({
                url: `../pay-suc/pay-suc?id=${rl.data}`,
              })
            }else{
              util.error(res)
              setTimeout(()=>{
                wx.redirectTo({
                  url: '../mine-order/mine-order',
                })
              },1000)
            }
          })
        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    eventHub.remove('setDefaultAddress')
    eventHub.remove('setCoupon')
  }

})