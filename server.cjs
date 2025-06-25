require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const binancePayRoute = require('./src/api/binance-pay.cjs');

const app = express();
app.use(cors());
app.use(express.json());

// Mount the Binance Pay route
app.use('/api', binancePayRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});