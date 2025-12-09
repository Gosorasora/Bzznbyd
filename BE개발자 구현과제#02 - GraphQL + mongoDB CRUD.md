# BE개발자 구현과제#02 - GraphQL + mongoDB CRUD

- 기한
    - 구현과제 알림 (D+0) ~  (D+4) 까지
    - 예시) 월요일에 과제알림 ⇒ 같은주 금요일 자정까지 구현
- 제출방법
    - github 또는 bitbucket 으로  소스 업로드후 공개된 접근 주소를 아래 이메일로 전달
        
        <aside>
        💡 recruit@bzznbyd.com
        
        </aside>
        
    - 설정 및 실행방법을 README.md 에 markdown 으로 기술
    - source repo checkout 후, 실행시 동작이 가능해야함.
    - **완료하지 못한 과제도 구현된 부분까지 제출**
    - **모르는 기술에 대해서 리서치하고 구현한 모든 과정을 잘 표현할 수 있는 자료도 자유양식으로 첨부**
- 구현과제
    - 목표
        - 원화 (KRW) <> 미화(USD) 의 환율정보를 CRUD하는 Graphql API Server 구현
        - 환율정보는 mongodb database 에 저장
    - API 기능상세
        - GraphQL Schema
            
            ```bash
            type Query {
              "환율조회"
              getExchangeRate(src:String!, tgt:String!): ExchangeInfo
            }
            
            type Mutation {
              "환율등록, src, tgt, date에 대해서 upsert"
              postExchangeRate(info: InputUpdateExchangeInfo): ExchangeInfo
              "환율삭제, 해당일자의 해당 통화간 환율을 삭제"
              deleteExchangeRate(info: InputDeleteExchangeInfo): ExchangeInfo
            }
            
            "환율업데이트정보 Input"
            input InputUpdateExchangeInfo {
              "소스통화, krw, usd"
              src: String!
              "타겟통화"
              tgt: String!
              "환율"
              rate: Float!
              "기준일, 값이 없으면, 최신일자로 등록"
              date: String
            }
            
            "환율삭제 Input"
            input InputDeleteExchangeInfo {
              "소스통화"
              src: String!
              "타겟통화"
              tgt: String!
              "기준일"
              date: String!
            }
            
            "환율정보"
            type ExchangeInfo @key(fields: "src, tgt") {
              "소스통화"
              src: String!
              "타겟통화"
              tgt: String!
              "환율"
              rate: Float!
              "기준일, 값이 없으면, 최신일자의 환율을 응답"
              date: String!
            }
            ```
            
        - 테스트
            - 테스트 서버는 [http://localhost:5110/graphql](http://localhost:5110/graphql) 에 구동된 것으로 가정
            - 환율조회
                - 테스트 스크립트1
                    
                    ```bash
                    #get
                    curl -XPOST "http://localhost:5110/graphql" --silent \
                    -H  "accept: application/json" \
                    -H  "Content-Type: application/json" \
                    -d '
                    { 
                      "query": "query { getExchangeRate (src: \"krw\", tgt: \"usd\") { src tgt rate date } }"
                    }
                    ' | jq
                    #result
                    {
                      "data": {
                        "getExchangeRate": {
                          "src": "krw",
                          "tgt": "usd",
                          "rate": 0.0007450954094671824,
                          "date": "2022-11-28"
                        }
                      }
                    }
                    ```
                    
                - 테스트 스크립트2
                    
                    ```bash
                    #get
                    curl -XPOST "http://localhost:5110/graphql" --silent \
                    -H  "accept: application/json" \
                    -H  "Content-Type: application/json" \
                    -d '
                    { 
                      "query": "query { getExchangeRate (src: \"usd\", tgt: \"krw\") { src tgt rate date } }"
                    }
                    ' | jq
                    #result
                    {
                      "data": {
                        "getExchangeRate": {
                          "src": "usd",
                          "tgt": "krw",
                          "rate": 1342.11,
                          "date": "2022-11-28"
                        }
                      }
                    }
                    ```
                    
                - 테스트 스크립트3
                    
                    ```bash
                    #get
                    curl -XPOST "http://localhost:5110/graphql" --silent \
                    -H  "accept: application/json" \
                    -H  "Content-Type: application/json" \
                    -d '
                    { 
                      "query": "query { getExchangeRate (src: \"usd\", tgt: \"usd\") { src tgt rate date } }"
                    }
                    ' | jq
                    #result
                    {
                      "data": {
                        "getExchangeRate": {
                          "src": "usd",
                          "tgt": "usd",
                          "rate": 1,
                          "date": "2022-11-28"
                        }
                      }
                    }
                    
                    ```
                    
                - 테스트 스크립트4
                    
                    ```bash
                    #get
                    curl -XPOST "http://localhost:5110/graphql" --silent \
                    -H  "accept: application/json" \
                    -H  "Content-Type: application/json" \
                    -d '
                    { 
                      "query": "query { getExchangeRate (src: \"krw\", tgt: \"krw\") { src tgt rate date } }"
                    }
                    ' | jq
                    #result
                    {
                      "data": {
                        "getExchangeRate": {
                          "src": "krw",
                          "tgt": "krw",
                          "rate": 1,
                          "date": "2022-11-28"
                        }
                      }
                    }
                    
                    ```
                    
            - 환율 업데이트
                - 테스트 스크립트1
                    
                    ```bash
                    #update
                    curl -XPOST "http://localhost:5110/graphql" --silent \
                    -H  "accept: application/json" \
                    -H  "Content-Type: application/json" \
                    -d '
                    { 
                      "query": "mutation { postExchangeRate (info: { src: \"usd\", tgt: \"krw\", rate: 1342.11, date:\"2022-11-28\" }) { src tgt rate date } }"
                    }
                    ' | jq
                    #result
                    {
                      "data": {
                        "postExchangeRate": {
                          "src": "usd",
                          "tgt": "krw",
                          "rate": 1342.11,
                          "date": "2022-11-28"
                        }
                      }
                    }
                    ```
                    
                - 테스트 스크립트2
                    
                    ```bash
                    #update
                    curl -XPOST "http://localhost:5110/graphql" --silent \
                    -H  "accept: application/json" \
                    -H  "Content-Type: application/json" \
                    -d '
                    { 
                      "query": "mutation { postExchangeRate (info: { src: \"krw\", tgt: \"krw\", rate: 2.0, date:\"2022-11-28\" }) { src tgt rate date } }"
                    }
                    ' | jq
                    
                    #result
                    {
                      "data": {
                        "postExchangeRate": {
                          "src": "krw",
                          "tgt": "krw",
                          "rate": 1,
                          "date": "2022-11-28"
                        }
                      }
                    }
                    ```
                    
            - 환율 삭제
                - 테스트 스크립트1
                    
                    ```bash
                    #delete
                    curl -XPOST "http://localhost:5110/graphql" --silent \
                    -H  "accept: application/json" \
                    -H  "Content-Type: application/json" \
                    -d '
                    { 
                      "query": "mutation { deleteExchangeRate (info: { src: \"usd\", tgt: \"krw\", date:\"2022-11-28\" }) { src tgt rate date } }"
                    }
                    ' | jq
                    #result
                    {
                      "data": {
                        "deleteExchangeRate": {
                          "src": "usd",
                          "tgt": "krw",
                          "rate": 1342.11,
                          "date": "2022-11-28"
                        }
                      }
                    }
                    ```
                    
                - 테스트 스크립트2
                    
                    ```bash
                    #delete
                    curl -XPOST "http://localhost:5110/graphql" --silent \
                    -H  "accept: application/json" \
                    -H  "Content-Type: application/json" \
                    -d '
                    { 
                      "query": "mutation { deleteExchangeRate (info: { src: \"krw\", tgt: \"krw\", date:\"2022-11-28\" }) { src tgt rate date } }"
                    }
                    ' | jq
                    #result
                    {
                      "data": {
                        "deleteExchangeRate": {
                          "src": "krw",
                          "tgt": "krw",
                          "rate": 1,
                          "date": "2022-11-28"
                        }
                      }
                    }
                    ```
                    
    - 사용 기술 stack
        - 백앤드 API 서버: node.js, graphql
        - database 서버: mongodb