require('dotenv').config();

const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const typeDefs = require('./schema'); // 스키마 가져오기 
const resolvers = require('./resolvers');
const { connectDB } = require('./db');

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
    listen: { port: parseInt(process.env.PORT) || 5110 }
  });

  console.log(`GraphQL 서버 실행중: ${url}graphql`);
};

startServer();
