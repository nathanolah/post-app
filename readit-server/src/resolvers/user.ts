import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Query, Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType } from "type-graphql";
import argon2 from 'argon2';

// input type is what we input into the mutations
@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

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

@Resolver()
export class UserResolver {
   @Query(() => User, {nullable: true})
   async me(
       @Ctx() { req, em }: MyContext
   ) {
       if (!req.session.userId) {
           return null;
       }
        
       const user = await em.findOne(User, {id: req.session.userId});
       return user;
   } 

   @Mutation(() => UserResponse)
   async register(
       @Arg('options') options: UsernamePasswordInput,
       @Ctx() { em }: MyContext 
   ): Promise<UserResponse> {
       if (options.username.length <= 2) {
           return {
               errors: [{
                   field: 'username',
                   message: "length must be greater than 2"
               }]
           }
       }
       
       if (options.password.length <= 2) {
           return {
               errors: [{
                   field: 'password',
                   message: "password must be greater than 2"
               }]
           }
       }

       const hashedPassword = await argon2.hash(options.password);
       const user = em.create(User, { 
           username: options.username,
           password: hashedPassword,
           createdAt: new Date(),
           updatedAt: new Date()
        });
       
       try {
           await em.persistAndFlush(user);
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

       return {
           user,
       };
   }

   @Mutation(() => UserResponse)
   async login(
       @Arg('options') options: UsernamePasswordInput,
       @Ctx() { em, req }: MyContext 
   ): Promise<UserResponse> {
       const user = await em.findOne(User, { username: options.username });
       if (!user) {
           return {
               errors: [{
                field: 'username',
                message: "username doesn't exist",
               }] 
           };
       }

       const valid = await argon2.verify(user.password, options.password);
       if (!valid) {
           return {
               errors: [{
                   field: 'password',
                   message: "incorrect password",
               }]
           };
       }

       req.session.userId = user.id;

       return {
           user,
       };
   }
   

}