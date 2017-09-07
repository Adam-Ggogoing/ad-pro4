var isProd = false

module.exports = {
  pageId: isProd?85:303,
  ajaxDomain: isProd ? {
    'item': `https://item.xianzaishi.com`,
    'trade': `https://trade.xianzaishi.com`,
    'purchase': `https://purchaseop.xianzaishi.com`
  } : {
    'item': `https://item.xianzaishi.net/wapcenter`,
    'trade': `https://trade.xianzaishi.net`,
    'purchase': `https://purchaseop.xianzaishi.com`
  }
}
