import {
  Arg,
  createUnionType,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";

import { AuthMiddleware } from "../middlewares/authMiddleware";
import { RequestResponseExpress } from "../types";
import { hash, verify } from "argon2";
import { User } from "../entity/User";

@ObjectType()
export class ErrorFieldUser {
  @Field()
  field: "username" | "password";

  @Field()
  message: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [ErrorFieldUser], { nullable: true })
  errors?: ErrorFieldUser[];
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await User.find();
  }

  @Query(() => User, { nullable: true })
  async currentUser(
    @Ctx() { req, res }: RequestResponseExpress
  ): Promise<User> {
    if (!req.session.userId) return null;
    const user = await User.findOne(
      { id: req.session.userId },
      { relations: ["profile"] }
    );
    return user;
  }

  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Arg("confirmPassword") confirmPassword: string,
    @Ctx() { req, res }: RequestResponseExpress
  ): Promise<UserResponse> {
    if (username.length < 6 || username.length > 16) {
      return {
        errors: [
          {
            field: "username",
            message: "Set username length between 6 and 16 characters",
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
            field: "password",
            message: "Set password length between 6 and 16 characters",
          },
        ],
      };
    }
    const user = await User.findOne({ username: username });
    if (user) {
      return {
        errors: [
          {
            field: "username",
            message: "Username aleready exists",
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
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() { req, res }: RequestResponseExpress
  ): Promise<UserResponse> {
    if (username.length < 6 || username.length > 16) {
      return {
        errors: [
          {
            field: "username",
            message: "Set username length 6 char",
          },
        ],
      };
    }
    if (password.length < 6 || password.length > 16) {
      return {
        errors: [
          {
            field: "password",
            message: "Password is not correct",
          },
          {
            field: "username",
            message: "Password is not correct",
          },
        ],
      };
    }
    const user = await User.findOne({ username }, { relations: ["profile"] });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
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
            field: "password",
            message: "Password is not correct",
          },
        ],
      };
    }
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(AuthMiddleware)
  logout(@Ctx() { req }: RequestResponseExpress): Boolean {
    req.session.destroy((error) => {
      console.log(error);
    });
    return true;
  }
}
