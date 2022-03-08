import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from 'path';

export default {
    migrations: {
        path: path.join(__dirname ,'./migrations'),
        pathTs: path.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}' // how to match migration files (all .js and .ts files, but not .d.ts)
    },
    entities: [Post, User], 
    dbName: 'readit-db',
    user: 'postgres',
    password: 'admin',
    type: 'postgresql',
    debug: !__prod__,

    allowGlobalContext: true
} as Parameters<typeof MikroORM.init>[0];