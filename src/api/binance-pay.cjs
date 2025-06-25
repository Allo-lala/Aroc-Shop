const express = require('express');
const crypto = require('crypto');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const router = express.Router();

const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET;

console.log('BINANCE_API_KEY:', process.env.BINANCE_API_KEY);
console.log('BINANCE_API_SECRET:', process.env.BINANCE_API_SECRET);

router.post('/binance-pay', async (req, res) => {
  const { amount } = req.body;

  const payload = {
    merchantTradeNo: 'ORDER_' + Date.now(),
    totalAmount: amount.toFixed(2),
    currency: 'USD',
    productType: 'Payment',
    goods: {
      goodsType: '01',
      goodsCategory: 'D000',
      referenceGoodsId: 'ArocShop',
      goodsName: 'Aroc Shop Order',
      goodsDetail: 'Order payment'
    }
  };

  const nonce = Date.now().toString();
  const payloadStr = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha512', BINANCE_API_SECRET)
    .update(payloadStr + nonce)
    .digest('hex');

  try {
    const response = await fetch('https://bpay.binanceapi.com/binancepay/openapi/v2/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': nonce,
        'BinancePay-Certificate-SN': BINANCE_API_KEY,
        'BinancePay-Signature': signature,
      },
      body: payloadStr,
    });
    const result = await response.json();
    if (result.status === 'SUCCESS') {
      res.json({ payUrl: result.data.qrContent });
    } else {
      res.status(400).json({ error: result });
    }
  } catch (err) {
    res.status(500).json({ error: 'Binance Pay API error' });
  }
});

module.exports = router;