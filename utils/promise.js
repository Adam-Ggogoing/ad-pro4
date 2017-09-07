var ajax = require('./ajax.js')

module.exports = {
  // 获取购物车数量
  getCartCount(uid,cb){
    return ajax({
      url: '/sc/getSumItemCount.json',
      domain:'trade',
      method:'post',
      data: { uid},
      success(result){
        if(result.success){
          cb&&cb(result.data)
        }
      }
    })
  },
  // 加入购物车
  appendItem({ uid, itemId, itemCount, skuId },cb){
    return ajax({
      url: '/sc/appendItem.json',
      method: 'post',
      domain: 'trade',
      data: {
        uid, itemId, itemCount, skuId
      },
      success(result){
        if(result.success){
          cb&&cb()
        }
      }
    })
  }
}