import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    BaseEntity,
    OneToMany
} from 'typeorm';
import { Field, Int, ObjectType } from "type-graphql";
import { Post } from './Post';
import { Upvote } from './Upvote';

@ObjectType() // This class is an object type of graphql
@Entity() // Entity decorator corresponds to a database table
export class User extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Field()
    @Column({ unique: true })
    username!: string;
    
    @Field()
    @Column({ unique: true })
    email!: string;
    
    @Column()
    password!: string;

    @OneToMany(() => Post, post => post.creator)
    posts: Post[];

    @OneToMany(() => Upvote, upvote => upvote.user)
    upvotes: Upvote[];

    @Field(() => String) // field decorator exposes this db column to our graphql schema
    @CreateDateColumn()
    createdAt: Date; 

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;



    // @OneToMany(() => Comment, comment => comment.creator)
    // comments: Comment[];

}