const { ExchangeRate } = require('./db');

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const resolvers = {
  Query: {
    // 환율 조회
    getExchangeRate: async (_, { src, tgt }) => {
      const srcLower = src.toLowerCase();
      const tgtLower = tgt.toLowerCase();

      // 같은 통화끼리는 항상 1
      if (srcLower === tgtLower) {
        const latestRecord = await ExchangeRate.findOne().sort({ date: -1 });
        return {
          src: srcLower,
          tgt: tgtLower,
          rate: 1,
          date: latestRecord?.date || getTodayDate()
        };
      }

      // 최신 날짜의 환율 조회
      const record = await ExchangeRate.findOne({ src: srcLower, tgt: tgtLower })
        .sort({ date: -1 });

      if (record) {
        return record;
      }

      // 역방향 환율 조회 후 계산
      const reverseRecord = await ExchangeRate.findOne({ src: tgtLower, tgt: srcLower })
        .sort({ date: -1 });

      if (reverseRecord) {
        return {
          src: srcLower,
          tgt: tgtLower,
          rate: 1 / reverseRecord.rate,
          date: reverseRecord.date
        };
      }

      return null;
    }
  },

  Mutation: {
    // 환율 등록/수정 (upsert)
    postExchangeRate: async (_, { info }) => {
      const { src, tgt, rate, date } = info;
      const srcLower = src.toLowerCase();
      const tgtLower = tgt.toLowerCase();
      const targetDate = date || getTodayDate();

      // 같은 통화끼리는 항상 rate 1로 저장
      const finalRate = srcLower === tgtLower ? 1 : rate;

      const result = await ExchangeRate.findOneAndUpdate(
        { src: srcLower, tgt: tgtLower, date: targetDate },
        { src: srcLower, tgt: tgtLower, rate: finalRate, date: targetDate },
        { upsert: true, new: true }
      );

      return result;
    },

    // 환율 삭제
    deleteExchangeRate: async (_, { info }) => {
      const { src, tgt, date } = info;
      const srcLower = src.toLowerCase();
      const tgtLower = tgt.toLowerCase();

      // 같은 통화끼리 삭제 요청시 rate 1로 응답
      if (srcLower === tgtLower) {
        await ExchangeRate.findOneAndDelete({ src: srcLower, tgt: tgtLower, date });
        return {
          src: srcLower,
          tgt: tgtLower,
          rate: 1,
          date
        };
      }

      const deleted = await ExchangeRate.findOneAndDelete({
        src: srcLower,
        tgt: tgtLower,
        date
      });

      return deleted;
    }
  }
};

module.exports = resolvers;
