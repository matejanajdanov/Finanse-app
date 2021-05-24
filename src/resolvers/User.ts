import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { hash, verify } from 'argon2';
import { User } from '../entity/User';
import { RequestResponseExpress } from '../types';

@ObjectType()
export class FieldError {
  @Field()
  field: 'username' | 'password';

  @Field()
  message: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await User.find();
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, res }: RequestResponseExpress): Promise<User> {
    const id = req.session.userId;
    if (!id) return null;
    return await User.findOne({ id });
  }

  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Arg('confirmPassword') confirmPassword: string,
    @Ctx() { req, res }: RequestResponseExpress
  ): Promise<UserResponse> {
    if (username.length < 4 || username.length > 16) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Set username length between 4 and 16 characters',
          },
        ],
      };
    }
    if (
      password.length < 6 ||
      password.length > 16 ||
      password !== confirmPassword
    ) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Set password length between 6 and 16 characters',
          },
        ],
      };
    }
    const user = await User.findOne({ username: username });
    if (user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Username aleready exists',
          },
        ],
      };
    }
    const hashPassword = await hash(password);

    const newUser = new User();
    newUser.username = username;
    newUser.password = hashPassword;

    await newUser.save();

    req.session.userId = newUser.id;

    return { user: newUser };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Ctx() { req, res }: RequestResponseExpress
  ): Promise<UserResponse> {
    if (username.length < 4 || username.length > 16) {
      return {
        errors: [
          {
            field: 'username',
            message: "Username doesn't exists",
          },
        ],
      };
    }
    if (password.length < 6 || password.length > 16) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password is not correct',
          },
        ],
      };
    }
    const user = await User.findOne({ username: username });
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "User doesn't exists",
          },
        ],
      };
    }
    const isVerified = await verify(user.password, password);
    if (!isVerified) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password is not correct',
          },
        ],
      };
    }
    req.session.userId = user.id;
    return { user };
  }
}
