import { MiddlewareFn } from "type-graphql";
import { User } from "../entity/User";
import { ErrorField } from "../resolvers/Profile";
import { RequestResponseExpress } from "../types";

ErrorField

export const AuthMiddleware: MiddlewareFn<RequestResponseExpress> = async ({ context }, next):Promise<ErrorField> => {
    if(!context.req.session.userId) {
        return {
            field: 'id',
            message: 'Not authenticated'
        }
    }
    const id = context.req.session.userId;
    const user = await User.findOne({id});
    if(!user) {
        return {
            field: 'id',
            message: 'Not authenticated'
        }
    }
    context.req.user = user;
    return next();
  };