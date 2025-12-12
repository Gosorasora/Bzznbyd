# 환율 정보 CRUD GraphQL API Server

원화(KRW) ↔ 미화(USD) 환율정보를 CRUD하는 GraphQL API 서버입니다.

## 기술 스택

- Node.js
- GraphQL (Apollo Server)
- MongoDB (Mongoose)

## 사전 요구사항

- Node.js 18.x 이상
- MongoDB 실행 중

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/Gosorasora/Bzznbyd.git
cd Bzznbyd/exchange-rate-api
```

### 2. 의존성 설치

```bash
npm install
```

### 3. MongoDB 실행

- env 사용시 별도로 설정을 해줘야하기에 env파일은 사용하지 않게 했습니다.

```bash
# macOS (Homebrew)
brew services start mongodb/brew/mongodb-community@7.0

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. 서버 실행

```bash
npm start
```

서버가 `http://localhost:5110/graphql` 에서 실행됩니다.

## API 테스트

### 환율 등록

```bash
curl -XPOST "http://localhost:5110/graphql" --silent \
-H "Content-Type: application/json" \
-d '{
  "query": "mutation { postExchangeRate (info: { src: \"usd\", tgt: \"krw\", rate: 1342.11, date:\"2022-11-28\" }) { src tgt rate date } }"
}' | jq
```

### 환율 조회

```bash
curl -XPOST "http://localhost:5110/graphql" --silent \
-H "Content-Type: application/json" \
-d '{
  "query": "query { getExchangeRate (src: \"usd\", tgt: \"krw\") { src tgt rate date } }"
}' | jq
```

### 환율 삭제

```bash
curl -XPOST "http://localhost:5110/graphql" --silent \
-H "Content-Type: application/json" \
-d '{
  "query": "mutation { deleteExchangeRate (info: { src: \"usd\", tgt: \"krw\", date:\"2022-11-28\" }) { src tgt rate date } }"
}' | jq
```

## 프로젝트 구조

```
exchange-rate-api/
├── src/
│   ├── index.js      # 서버 엔트리포인트
│   ├── schema.js     # GraphQL 스키마
│   ├── resolvers.js  # 비즈니스 로직
│   └── db.js         # MongoDB 연결
└── package.json
```
