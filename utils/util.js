var config = require('./config.js')

var numToStr = num => {
  return num < 10 ? ('0' + num) : num + ''
}

module.exports = {
  gotoLogin: ()=>{
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  //1489722617000 -> 2017-3-17 11:50:17
  parseDate : (timesamp) => {
    var date = new Date(timesamp)
    var dayParse = [date.getFullYear(), numToStr(date.getMonth() + 1), numToStr(date.getDate())].join('-')
    var timeParse = [numToStr(date.getHours()), numToStr(date.getMinutes()), numToStr(date.getSeconds())].join(':')
    return dayParse+'   '+timeParse
  },

  parseDay: (timesamp) => {
    var date = new Date(timesamp)
    var dayParse = [date.getFullYear(), numToStr(date.getMonth() + 1), numToStr(date.getDate())].join('-')
    return dayParse
  },
  
  //1489722617000 -> 11:50:17
  parseTime : (timesamp) => {
    var date = new Date(timesamp)
    return [numToStr(date.getHours()), numToStr(date.getMinutes())].join(':')
  },
  parseDateStr : (timesamp) => {
    var date = new Date(timesamp)
    return [date.getFullYear(), numToStr(date.getMonth() + 1), numToStr(date.getDate())].join('') +
      '' + [numToStr(date.getHours()), numToStr(date.getMinutes()), numToStr(date.getSeconds())].join('')
  },
  error: (title, success, fail) => {
    return wx.showToast({
      title,
      icon: 'error',
      duration: 2000,
      success,
      fail
    })
  },
  msg: (title, success, fail) => {
    return wx.showToast({
      title,
      icon: 'success',
      duration: 2000,
      success,
      fail
    })
  },
  refresh:()=>{
    var pages = getCurrentPages()
    for (var i = 0; i < pages.length; i++) {
      if (pages.length - 1 > i && pages[i].onLoad) {
        pages[i].onLoad(pages[i].options)
      }
    }
  }
}
