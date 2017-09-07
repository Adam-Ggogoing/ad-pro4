var util = require('./util.js')

function EventEmitter(){
  this.hub = {}
}

var isString = str => typeof(str)==='string'
var isFunc = func => typeof(func)==='function'

EventEmitter.prototype.add = function(name,cb){
  if(!isString(name)&&!isFunc(cb)){
    return util.error('参数格式不对')
  }  
  var {hub} = this
  hub[name] = hub[name]||[]
  hub[name].push(cb)
}

EventEmitter.prototype.remove = function(name,cb){
  var {hub} = this  
  if(isString(name)&&isFunc(cb)){
    hub[name] = (hub[name]||[]).filter(h=>h!==cb)
  }
  if(isString(name)&&cb===undefined&&hub[name]){
    hub[name] = []
  }
}

EventEmitter.prototype.emit = function (name, argu){
  var {hub} = this
  if(!isString(name)){
    return util.error('参数格式不对')
  }
  if(hub[name]){
    return hub[name].map(n=>n(argu))
  }
  return []
}

module.exports = EventEmitter