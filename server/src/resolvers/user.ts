import { Query, Resolver, Mutation, Arg, Field, Ctx, ObjectType, FieldResolver, Root } from "type-graphql";
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
import { MyContext } from "../types";
import { User } from "../entities/User";
import { getConnection } from "typeorm";
 
@ObjectType()
class FieldError {
    @Field()
    field: string;
    
    @Field()
    message: string;
}

// object type is what we return from are mutations
@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver(User)
export class UserResolver {

    @FieldResolver(() => String)
    email(
        @Root() user: User,
        @Ctx() { req }: MyContext
    ) {
        // check if this is the current user that is currently logged in 
        if (req.session.userId === user.id) {
            return user.email // show the user their email
        }

        // user wants to view someone elses email
        return "";
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string, 
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        // validate new password
        if (newPassword.length <= 2) {
            return { 
                errors: [
                    {
                        field: "newPassword",
                        message: "length must be greater than 2"
                    },
                ],
            };
        }

        const key = FORGET_PASSWORD_PREFIX + token;
        // validate token, find the value in the token 'user.id'
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired" 
                    },
                ], 
            };
        }

        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);
        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists",
                    },
                ],
            };
        }
        
        await User.update(
            { id: userIdNum },
            { password: await argon2.hash(newPassword) } // hash new password
        );

        await redis.del(key); // delete token

        // log in user after change password
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } }); // since email is not a primary column we have to search with 'where'.
        if (!user) {
            // user is not in the db
            return false;
        }

        const token = v4();

        await redis.set(
            FORGET_PASSWORD_PREFIX + token, // key
            user.id, // value
            'ex', // expiry mode
            1000 * 60 * 60 * 24 * 3 // 3 days till expired
        ); 

        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
        );

        return true;
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: MyContext
    ) {
        if (!req.session.userId) {
            return null;
        }
        
        return await User.findOne(req.session.userId);
    } 

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext 
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return { errors };
        }

        const hashedPassword = await argon2.hash(options.password);
        let user;
        try {
            // User.create({
            //     username: options.username,
            //     email: options.email,
            //     password: hashedPassword
            // }).save();
            
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                        username: options.username,
                        email: options.email,
                        password: hashedPassword
                })
                .returning("*")
                .execute();
            
            user = result.raw[0];
        } catch (err) {

            if (err.code === '23505') {
                return {
                    errors: [{
                        field: 'username',
                        message: "username has already been taken",
                    }]
                }
            } else {
                console.log('message: ', err.message);
            }
        }

        req.session.userId = user.id;

        return {
            user,
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req }: MyContext 
    ): Promise<UserResponse> {
        // Find the user with either an email or username
        const user = await User.findOne(
            usernameOrEmail.includes('@') 
                ? { where: { email: usernameOrEmail } }
                : { where: { username: usernameOrEmail } }  
        );
        
        if (!user) {
            return {
                errors: [{
                field: 'usernameOrEmail',
                message: "username doesn't exist",
                }] 
            };
        }

        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: "incorrect password",
                }]
            };
        }

        // store the user id session
        // this will set the cookie on the user
        // to keep them logged in
        req.session.userId = user.id;

        return {
            user,
        };
    }
   
    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise(resolve => 
            req.session.destroy(err => {
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return; 
                }

                resolve(true);
            })
        );
    }

}