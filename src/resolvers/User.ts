import { Query, Resolver } from 'type-graphql';
import { User } from '../entity/User'

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await User.find();
  }
}
