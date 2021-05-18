import * as express from 'express';
import 'reflect-metadata';
import { config } from 'dotenv';
import { createConnection } from 'typeorm';
import { Post } from './entity/Post';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { Posts } from './resolvers/Posts';

// Init env file
config();

const main = async () => {
  // DATABASE CONNECTION
  const connection = await createConnection();
  const postRepository = connection.getRepository(Post);

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [Posts],
      validate: false,
    }),
    context: { ctx: postRepository },
  });

  apolloServer.applyMiddleware({ app });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
  });
};

main();
