import { Request, Response, NextFunction} from "express";
import { User } from "./entity/User";

declare module 'express' {
  export interface Request{
     user?: User
  }
}

declare module 'express-session' {
  export interface SessionData {
    userId?: number;
  }
}

export type RequestResponseExpress = {
    req: Request;
    res: Response;
    next?: NextFunction;
}