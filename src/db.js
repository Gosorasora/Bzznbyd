const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  src: { type: String, required: true, lowercase: true },
  tgt: { type: String, required: true, lowercase: true },
  rate: { type: Number, required: true },
  date: { type: String, required: true }
});

// src, tgt, date 조합으로 유니크 인덱스
exchangeRateSchema.index({ src: 1, tgt: 1, date: 1 }, { unique: true });

const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);

const MONGODB_URI = 'mongodb://localhost:27017/exchange_rate';
//env로 처리시 checkout 후 실행 오류. -> env사용 X 

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, ExchangeRate };
