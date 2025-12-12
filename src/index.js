const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { connectDB } = require('./db');

const PORT = 5110;
//env로 처리시 checkout 후 실행 오류. -> env사용 X 

const startServer = async () => {
  // MongoDB 연결
  await connectDB();

  // Apollo Server 생성
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  // 서버 시작 http://localhost:5110/graphql
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT }
  });

  console.log(`GraphQL 서버 실행중: ${url}graphql`);
};

startServer();
