import { Ctx, Query, Resolver } from 'type-graphql';
import { Post } from '../entity/Post';
// import { Context } from '../types';

@Resolver()
export class Posts {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return await Post.find();
  }
}
