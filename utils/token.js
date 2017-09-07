const key = 'token'
module.exports = {
  get(){
    return wx.getStorageSync(key)
  },
  set(token){
    return wx.setStorageSync(key, token)
  }
}