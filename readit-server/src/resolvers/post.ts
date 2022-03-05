import { Post } from "../entities/Post";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";
// import { EntityManager } from '@mikro-orm/postgresql';


@Resolver()
export class PostResolver {
    @Query(() => [Post]) // returns an array of Posts
    async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    
        return await em.find(Post, {});
    }


    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', () => Int) id: number,
        @Ctx() ctx: MyContext 
    ): Promise<Post | null> {
        
        return ctx.em.findOne(Post, { id });
        
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post> {
        
        const post = em.create(Post, {title, createdAt: new Date, updatedAt: new Date() });
        await em.persistAndFlush(post);
        return post;
    }

    // Get id of post and new title.
    // if the title  
    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string, // optional fields can be set to nullable
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        
        const post = em.findOne(Post, { id });
        if (!post) {
            return null;
        }
        
        if (typeof title !== 'undefined') {
           // post.title = title;
            await em.persistAndFlush(post);

        }
        
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,
        @Ctx() { em }: MyContext
    ): Promise<boolean> {
        em.nativeDelete(Post, { id });
        return true;
    }




}