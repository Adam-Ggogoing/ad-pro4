var ajax = require('./ajax.js')
var tokenTool = require('./token.js')

module.exports = function(token,success,fail){
  return ajax({
    url:'/requestuser/mine',
    method:'post',
    ignoreLogin:true,
    data:{
      token
    },
    success(data){
      if (!data.success) {
        tokenTool.set(null)
      }
      typeof(success) === 'function'&&success(data.module)
    },
    fail(e){
      typeof(fail) === 'function' && fail(e)
    }
  })
}