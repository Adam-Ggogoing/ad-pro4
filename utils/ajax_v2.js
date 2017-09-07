var ajax = require('./ajax.js')

module.exports = (param)=>{
  param.data = param.data||{}
  param.header = {
    'content-type':'application/json'
  }
  param.data = JSON.stringify({
    version:1,
    src:'routine',
    appversion:"1",
    data:param.data
  })
  return ajax(param)
}