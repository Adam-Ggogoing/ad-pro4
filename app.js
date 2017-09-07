var EventEmitter = require('./utils/eventEmitter.js')
var token = require('./utils/token.js')
var util = require('./utils/util.js')

//app.js
App({
  onLaunch: function () {
    //util.gotoLogin()
  },
  eventHub: new EventEmitter()
})