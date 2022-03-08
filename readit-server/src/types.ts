import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { SessionData } from 'express-session';

// declare module 'express-session' {
//     export interface SessionData {
//         userId?: any;
//     }
// }

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    //req: Request & {sessionData: SessionData};
    req: Request;
    res: Response;
}