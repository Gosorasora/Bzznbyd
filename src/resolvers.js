//db.js에서 만든 몽고디비 모델 가져옴 
const { ExchangeRate } = require('./db'); 

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
// T 기준으로 자르기 
// 요구사항 : "기준일, 값이 없으면, 최신일자로 등록"
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const resolvers = {
  // 조회 => Query
  Query: {
    // 환율 조회
    // DB 조회는 시간이 걸리니 비동기로 설정
    getExchangeRate: async (_, { src, tgt }) => {
      //대소문자 통일 use == USD 
      const srcLower = src.toLowerCase();
      const tgtLower = tgt.toLowerCase();

      //같은 통화끼리는 항상 환율 : 1
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
      const record = await ExchangeRate.findOne({ src: srcLower, tgt: tgtLower }).sort({ date: -1 }); //가장 최근 데이터 가져오기

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
          rate: 1 / reverseRecord.rate, // 역수로 계산
          date: reverseRecord.date
        };
      }

      return null;
    }
  },

  // 등록 수정 삭제 => Mutation
  Mutation: {
    // 환율 등록/수정 (upsert)
    // info = input 객체 전체 
    postExchangeRate: async (_, { info }) => {
      const { src, tgt, rate, date } = info;
      const srcLower = src.toLowerCase();
      const tgtLower = tgt.toLowerCase();
      const targetDate = date || getTodayDate();

      // 같은 통화끼리는 항상 rate 1로 저장
      // === type 까지 비교
      let finalRate;
      if (srcLower === tgtLower) {
        const finalRate = 1;
      } else {
        const finalRate = rate;
      }

      const result = await ExchangeRate.findOneAndUpdate(
        { src: srcLower, tgt: tgtLower, date: targetDate }, //찾는 조건
        { src: srcLower, tgt: tgtLower, rate: finalRate, date: targetDate }, // 저장할 데이터 
        { upsert: true, new: true } // 옵션 
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
        // Test를 위한 더미데이터 생성 -> 데이터가 없을 때 삭제할 경우 
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

      //요구사항 : 삭제된 데이터 응답으로 보여줄 것 
      return deleted;
    }
  }
};

module.exports = resolvers;
