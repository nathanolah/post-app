import "reflect-metadata"; // required for type-graphql and typeorm
import "dotenv-safe/config";
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post'; 
import { UserResolver } from "./resolvers/user";
import path from 'path'
import Redis from 'ioredis';
import session from 'express-session'; 
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Upvote } from "./entities/Upvote";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

const main = async() => {

    await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        //synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [Post, User, Upvote]
    }); 

    //await conn.runMigrations(); 

    //await Post.delete({});

    // Express server
    const app = express();

    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true
        })
    );

    const RedisStore = connectRedis(session);
    const redis = new Redis(process.env.REDIS_URL);

    // This will allow the cookies to work in a proxy environment
    // nginx will be sitting in front of the api.
    app.set('trust proxy', 1); // tells express we have 1 proxy.

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis,
                //client: redisClient as any,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: "lax", // related to protecting the csrf
                secure: __prod__, // __prod__ // cookie only works in https
                domain: __prod__ ? ".nolah.xyz" : undefined
            },
            saveUninitialized: false, 
            secret: process.env.SESSION_SECRET, 
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
        context: ({ req, res }) => ({ 
            req,
            res,
            redis,
            userLoader: createUserLoader(), // a new userLoader will be created on every request (batches and caches)
            upvoteLoader: createUpvoteLoader(),
        }),
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground()
        ]
    });

    await apolloServer.start();

    // Add graphql data to the Express server
    apolloServer.applyMiddleware({
        app,
        cors: false
    });

    app.listen(parseInt(process.env.PORT), () => {
        console.log(`server is running on port localhost:${ process.env.PORT }`);
    })

}

main().catch(err => console.log(err));