var util = require('./util.js')

var domainMap = require('./config.js').ajaxDomain

module.exports = (param) => {
  var { url, success, complete } = param

  // wx.showLoading({
  //   title: '数据正在加载'
  // })
  var domainName = param.domain || 'item'
  var domain = domainMap[domainName]
  param.url = param.url ? (domain + param.url) : domain
  if (domainName === 'trade') {
    param.header = param.header || { 'content-type': 'application/x-www-form-urlencoded' }
  }
  param.success = (result) => {
    var resultData = result.data;
    (success || (() => { })).call(param, resultData)
    if (!resultData.success) {
      if ([-5, -7].indexOf(resultData.resultCode) > -1 && !param.ignoreLogin) {
        util.gotoLogin()
        return util.error('登录过期,请重新登录')
      }
      util.error(resultData.message||resultData.errorMsg || '请求出错')
    }
  }
  param.complete = () => {
    (complete || (() => { })).call(param)
    // setTimeout(()=>{
    //   wx.hideLoading()
    // },500)
  }

  return wx.request(param)
}