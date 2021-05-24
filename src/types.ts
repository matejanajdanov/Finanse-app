import { Request, Response } from "express";

import * as session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    userId: number;
  }
}

export type RequestResponseExpress = {
    req: Request;
    res: Response;
}