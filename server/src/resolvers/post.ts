import { 
    Arg, 
    Ctx, 
    Field, 
    FieldResolver, 
    InputType, 
    Int, 
    Mutation, 
    ObjectType, 
    Query, 
    Resolver, 
    Root, 
    UseMiddleware
} from "type-graphql";
import { MyContext } from "../types";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@ObjectType() 
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];
    @Field()
    hasMore: boolean;
}

// When using field resolver we need to add Post to the Resolver decorator
@Resolver(Post)
export class PostResolver {

    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ) {
        return root.text.slice(0, 50);
    } 

    @FieldResolver(() => User)
    creator(
        @Root() post: Post,
        @Ctx() { userLoader }: MyContext
    ) {
        return userLoader.load(post.creatorId);
    }
    
    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(
        @Root() post: Post,
        @Ctx() { upvoteLoader, req }: MyContext
    ) {
        // if they are not logged in they already do not have a vote status.
        if (!req.session.userId) {
            return null; 
        }

        // if we cant find an upvote the user hasn't voted.
        const upvote = await upvoteLoader.load({ 
            postId: post.id,
            userId: req.session.userId
        });

        return upvote ? upvote.value : null;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext 
    ) {
        const isUpvote = value !== -1;
        const realValue = isUpvote ? 1 : -1;
        const { userId } = req.session;

        const upvote = await Upvote.findOne({where: { postId, userId } });

        /* Perform a SQL transaction since we are grouping a set of tasks into a single execution (insert and update) */
        //
        // if the user has voted on the post before and is changing their vote
        if (upvote && upvote.value !== realValue) {
            await getConnection().transaction(async tm => {
                await tm.query(`
                    update upvote
                    set value = $1
                    where "postId" = $2 and "userId" = $3
                `, [realValue, postId, userId]);

                await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2
                `, [2 * realValue, postId]);
            });
        } else if (!upvote) { // user has never voted before

            // typeorm transaction manager will handle any errors with a transaction
            await getConnection().transaction(async tm => {
                // 'tm' is transaction manager object
                await tm.query(`
                    insert into upvote ("userId", "postId", value)
                    values ($1, $2, $3)
                `, [userId, postId, realValue]);

                await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2
                `, [realValue, postId]);
            });
        }
        
        return true;
    }

    @Query(() => PaginatedPosts) // returns an array of Posts
    async posts(
        @Arg('limit', () => Int) limit: number, // number without the Int type cast defaults the arg to a float
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {

        // Sets the limit cap to 50. 
        const realLimit = Math.min(50, limit); 
        // Plus one extra post to check if hasMore posts is true.
        const realLimitPlusOne = realLimit + 1;
        const replacements: any[] = [realLimitPlusOne];

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const posts = await getConnection().query(`
            select p.*
            from post p
            ${cursor ? `where p."createdAt" < $2` : ""}
            order by p."createdAt" DESC
            limit $1
        `, replacements);

        return {
            posts: posts.slice(0, realLimit), // slice the posts to only provide the 'limit' amount of posts
            hasMore: posts.length === realLimitPlusOne, // checks if there are more posts
        }

    }

    @Query(() => PaginatedPosts) 
    async topPosts(
        @Arg('limit', () => Int) limit: number,
    ): Promise<PaginatedPosts> {
        // Sets the limit cap to 50. 
        const realLimit = Math.min(50, limit); 
        // Plus one extra post to check if hasMore posts is true.
        const realLimitPlusOne = realLimit + 1;
       
        // query the top voted posts in desc order
        const qb = getConnection()
            .getRepository(Post)
            .createQueryBuilder('p')
            .where('p.points > 0')
            .orderBy('p.points', 'DESC')
            .take(realLimitPlusOne);

       const topPosts = await qb.getMany();
        
        return {
            posts: topPosts.slice(0, realLimit),
            hasMore: topPosts.length === realLimitPlusOne
        }
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', () => Int) id: number
    ): Promise<Post | undefined> {
        return Post.findOne(id);
        //return Post.findOne(id, { relations: ["creator"] }); // left join the 'creator: User' relation'
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        return Post.create({
            ...input,
            creatorId: req.session.userId
        }).save();
    }

    // Get id of post and new title.
    // if the title  
    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string, // optional fields can be set to nullable
        @Arg('text') text: string,
        @Ctx() { req }: MyContext
    ): Promise<Post | null> {

        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id and "creatorId" = :creatorId', { 
                id, 
                creatorId: req.session.userId
            })
            .returning("*") // returns the post that we update
            .execute();
        
        return result.raw[0];

        // const post = await Post.findOne(id);
        // if (!post) { 
        //     return null; // if post does not exist
        // }
        
        // if (typeof title !== 'undefined') {
        //    await Post.update({ id }, { title });
        // } 
        
        //return post;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        // not cascade way
        const post = await Post.findOne(id);
        if (!post) {
            return false;
        }

        const user = await User.findOne(req.session.userId);
        
        // admin delete
        if (user.username === 'admin') {
            console.log('admin delete');
            await Upvote.delete({postId: id}); // delete the upvotes for this post
            await Post.delete({ id }); // delete post
            return true;
        } 

        if (post.creatorId !== req.session.userId) {
            console.log('user not allow to delete post')
            throw new Error("user is not authorized to delete this post");
        } 
        
        await Upvote.delete({postId: id}); // delete the upvotes for this post
        await Post.delete({ id }); // delete post

        // using the casade way
        //await Post.delete({ id, creatorId: req.session.userId }); // where clause

        return true;
    }
}