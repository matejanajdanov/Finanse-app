import { ApolloServer } from "apollo-server-express";
import * as connectRedis from "connect-redis";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import * as session from "express-session";
import * as express from "express";
import { config } from "dotenv";
import * as redis from "redis";
import * as cors from "cors";
import "reflect-metadata";

import { CategoryResolver } from "./resolvers/Category";
import { ProfileResolver } from "./resolvers/Profile";
import { ExpenseResolver } from "./resolvers/Expense";
import { IncomeResolver } from "./resolvers/Income";
import { RequestResponseExpress } from "./types";
import { UserResolver } from "./resolvers/User";

// Init env file
config();

const main = async () => {
  // DATABASE CONNECTION
  const app = express();
  await createConnection();
  let redisStore = connectRedis(session);
  let redisClient = redis.createClient();

  // Create session
  app.use(
    session({
      name: "qid",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax",
      },
      store: new redisStore({ client: redisClient, disableTouch: true }),
      saveUninitialized: false,
      secret: process.env.REDIS,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        CategoryResolver,
        ProfileResolver,
        ExpenseResolver,
        IncomeResolver,
        UserResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }: RequestResponseExpress) => ({ req, res }),
  });

  app.use(cors({ origin: "http://localhost:3000", credentials: true }));

  apolloServer.applyMiddleware({ app, cors: false });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
  });
};

main();
