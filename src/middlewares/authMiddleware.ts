import { Field, MiddlewareFn, ObjectType } from "type-graphql";
import { User } from "../entity/User";
import { RequestResponseExpress } from "../types";

@ObjectType()
export class ErrorField {
  @Field()
  field: string;
  @Field()
  message: string;
}

export const AuthMiddleware: MiddlewareFn<RequestResponseExpress> = async (
  { context },
  next
): Promise<ErrorField | null> => {
  if (!context.req.session.userId) {
    throw new Error("Not authenticated!");
  }
  const id = context.req.session.userId;
  const user = await User.findOne({ id }, { relations: ["profile"] });
  if (!user) {
    throw new Error("Not authenticated");
  }
  context.req.user = user;
  return next();
};
