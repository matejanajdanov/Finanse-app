import 'reflect-metadata';
import * as express from 'express';
import { config } from 'dotenv';
import { createConnection } from 'typeorm';
import { UserResolver } from './resolvers/User';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import * as redis from 'redis';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import { RequestResponseExpress } from './types';
import { ProfileResolver } from './resolvers/Profile';

// Init env file
config();

const main = async () => {
  // DATABASE CONNECTION
  const app = express();
  await createConnection();

  let redisStore = connectRedis(session);
  let redisClient = redis.createClient();
  app.use(
    session({
      name: 'qid',
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
      },
      store: new redisStore({ client: redisClient, disableTouch: true }),
      saveUninitialized: false,
      secret: process.env.REDIS,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, ProfileResolver],
      validate: false,
    }),
    context: ({ req, res }: RequestResponseExpress) => ({ req, res }),
  });

  apolloServer.applyMiddleware({ app });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
  });
};

main();
