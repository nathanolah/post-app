import "reflect-metadata"; // required for type-graphql
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import config from './mikro-orm.config';
//import { EntityManager } from '@mikro-orm/postgresql';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post'; 
import { UserResolver } from "./resolvers/user";

import * as redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
//import cors from 'cors';

//import { Post } from './entities/Post';
//import path from 'path'

import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

// install typeorm
// connect typeorm to db, then setup resovlers, perform crud operations

const main = async() => {
    //console.log(path.join(__dirname ,'./migrations'));

    const orm = await MikroORM.init(config); 
    await orm.getMigrator().up();
    //const em = orm.em as EntityManager;
    
    // create the instance of Post 
    //const post = orm.em.create(Post, {title: 'my first post', createdAt: new Date(), updatedAt: new Date() });
    
    // Insert into the db
    //await orm.em.persistAndFlush(post);
    
    //const posts = await orm.em.find(Post, {});
    //const posts = await em.find(Post, {});
    
    // Express server
    const app = express();

    // app.use(
    //     cors({
    //         origin: "http://localhost:4000/graphql",
    //         credentials: true
    //     })
    // );

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient({ legacyMode: true });
    redisClient.connect().catch(console.error);


    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ 
                client: redisClient as any,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: "lax", // related to protecting the csrf
                secure: false // __prod__ // cookie only works in https
            },
            saveUninitialized: false, 
            secret: "keyboard cat", 
            resave: false,
        })
    );


    // graphql endpoint
    const apolloServer = new ApolloServer({
        // build schema returns a promise with the graphql schema
        schema: await buildSchema({ 
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res }),
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground()
        ]
    });

    await apolloServer.start();

    // Add graphql data to the Express server
    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('server is running on port localhost:4000');
    })

}

main().catch(err => console.log(err));