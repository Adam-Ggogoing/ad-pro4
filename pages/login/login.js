var maxTime = 60
var codeMsgBak = '获取短信密码'
var ajax = require('../../utils/ajax.js')
var token = require('../../utils/token.js')
var md5 = require('../../utils/md5.js')
var util = require('../../utils/util.js')

Page({
  data:{
    waitTime:maxTime,
    codeMsg: codeMsgBak,
    phone:'',
    code:'', 
    passwordLogin: false,
  },
  turnLogin() {
    var passwordLogin = this.data.passwordLogin
    passwordLogin = !passwordLogin
    this.setData({ passwordLogin})
  },
  forgot() {
    var passwordLogin = this.data.passwordLogin
    passwordLogin=false
    this.setData({ passwordLogin })
  },
  interval:null,
  startCount(){
    var {waitTime} = this.data
    if(waitTime===maxTime){
      this.setData({
        waitTime:waitTime-1
      })
      this.interval = setInterval(()=>{
        var {waitTime} = this.data
        if(waitTime===0){
          this.setData({
            waitTime:maxTime,
            codeMsg:codeMsgBak
          })
          clearInterval(this.interval)
          this.interval = null
        }else{
          var currentTime = waitTime - 1
          this.setData({
            waitTime: currentTime,
            codeMsg: `还剩${currentTime}秒`
          })
        }
      },1000)
    }
  },
  getCode(){
    var {waitTime,phone} = this.data
    var phoneTest=/^1[3456789]\d{9}$/.test(phone)
    if(!phoneTest){
      wx.showToast({
        title: '手机号码输入错误',
      })
    return ''
    }
    if (waitTime === maxTime ){
      var that=this
      ajax({
        url:'/requestuser/sendcheckcode',
        method:'POST',
        dataType:'json',
        data:{
          phone
        },
        success(result){
          if(result.success){
            wx.showToast({
              title: '验证码发送成功',
            })
            that.startCount()
          }
        }
      })
    }
  },
  codeInput(e){
    this.setData({code:e.detail.value})
  },
  phoneInput(e){
    this.setData({phone:e.detail.value})
  },
  submit(){
    var { phone, code, passwordLogin} = this.data
    var hardwareCode = "359583072058301"
    var phoneTest = /^1[3456789]\d{9}$/.test(phone)
    if (!phoneTest){
      wx.showToast({
        title: '手机号码输入有误',
      })
      return ''
    }
    if (!code){
      wx.showToast({
        title: '请输入验证码',
      })
      return ''
    }
    if (passwordLogin) {
      var loginTime = +new Date
      var sign = md5(`${md5(code)}_${loginTime}_${hardwareCode}`)
      ajax({
        url: '/requestuser/loginwithpwd',
        method: 'post',
        data: {
          phone,
          hardwareCode,
          loginTime,
          sign
        },
        success(result) {
          if (result.success) {
            wx.showToast({
              title: '登陆成功,即将跳转'
            })
            token.set(result.module.token)
            setTimeout(() => {
              util.refresh()
              wx.navigateBack()
            }, 1000)
          }
        }
      })
    }else{
      ajax({
        url:"/requestuser/activitylogin",
        method:'post',
        data: {
          hardwareCode,
          phone,
          reuseToken:"true",
          verificationCode:code
        },
        success(result){
          if(result.success){
            wx.showToast({
              title:'登陆成功,即将跳转'
            })
            token.set(result.module.token)
            setTimeout(()=>{
              util.refresh()
              wx.navigateBack()
            },1000)
          }
        }
      })
    }
  }
})
