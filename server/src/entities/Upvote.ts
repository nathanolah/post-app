import { 
    Entity, 
    Column, 
    BaseEntity,
    ManyToOne,
    PrimaryColumn
} from 'typeorm';
import { ObjectType } from "type-graphql";
import { User } from './User';
import { Post } from './Post';

// many to many relationship (user <-> posts) 
// user -> posts, where one user can vote on many posts.
// post -> users. where one post can be voted by many users.
/*  
    user -> join table <- posts
    user -> upvote <- posts
*/

@ObjectType() // This class is an object type of graphql
@Entity() // Entity decorator corresponds to a database table
export class Upvote extends BaseEntity { // BaseEntity allows use to run commands related to SQL
    
    @Column({ type: "int" })
    value: number;

    // Upvote is unique based on the two primary columns userId and postId
    @PrimaryColumn()
    userId: number; 

    @ManyToOne(() => User, user => user.upvotes)
    user: User;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post, post => post.upvotes /*, { onDelete: "CASCADE" }*/)
    post: Post;
}