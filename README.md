# 환율 정보 CRUD GraphQL API Server

원화(KRW) ↔ 미화(USD) 환율정보를 CRUD하는 GraphQL API 서버입니다.

## 기술 스택

- **Backend**: Node.js, Apollo Server (GraphQL)
- **Database**: MongoDB

## 사전 요구사항

- Node.js 18.x 이상
- MongoDB 실행 중 (로컬 또는 원격)

## 설치 및 실행

### 1. 의존성 설치

```bash
cd exchange-rate-api
npm install
```

### 2. 환경변수 설정

`.env` 파일을 수정하거나 새로 생성:

```env
MONGODB_URI=mongodb://localhost:27017/exchange_rate
PORT=5110
```

### 3. MongoDB 실행

로컬에서 MongoDB가 실행 중이어야 합니다.

```bash
# Docker 사용시
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. 서버 실행

```bash
npm start
```

서버가 `http://localhost:5110/graphql` 에서 실행됩니다.

## API 사용법

### 환율 등록 (Mutation)

```bash
curl -XPOST "http://localhost:5110/graphql" --silent \
-H "accept: application/json" \
-H "Content-Type: application/json" \
-d '{
  "query": "mutation { postExchangeRate (info: { src: \"usd\", tgt: \"krw\", rate: 1342.11, date:\"2022-11-28\" }) { src tgt rate date } }"
}'
```

### 환율 조회 (Query)

```bash
curl -XPOST "http://localhost:5110/graphql" --silent \
-H "accept: application/json" \
-H "Content-Type: application/json" \
-d '{
  "query": "query { getExchangeRate (src: \"usd\", tgt: \"krw\") { src tgt rate date } }"
}'
```

### 환율 삭제 (Mutation)

```bash
curl -XPOST "http://localhost:5110/graphql" --silent \
-H "accept: application/json" \
-H "Content-Type: application/json" \
-d '{
  "query": "mutation { deleteExchangeRate (info: { src: \"usd\", tgt: \"krw\", date:\"2022-11-28\" }) { src tgt rate date } }"
}'
```

## GraphQL Schema

```graphql
type Query {
  "환율조회"
  getExchangeRate(src: String!, tgt: String!): ExchangeInfo
}

type Mutation {
  "환율등록, src, tgt, date에 대해서 upsert"
  postExchangeRate(info: InputUpdateExchangeInfo): ExchangeInfo
  "환율삭제, 해당일자의 해당 통화간 환율을 삭제"
  deleteExchangeRate(info: InputDeleteExchangeInfo): ExchangeInfo
}

type ExchangeInfo {
  src: String!
  tgt: String!
  rate: Float!
  date: String!
}
```

## 주요 기능

- **환율 조회**: 최신 날짜의 환율 반환, 역방향 환율 자동 계산
- **환율 등록**: src, tgt, date 기준 upsert
- **환율 삭제**: 특정 날짜의 환율 삭제
- **동일 통화**: src와 tgt가 같으면 rate는 항상 1
