import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    BaseEntity,
    ManyToOne,
    OneToMany
} from 'typeorm';
import { Field, Int, ObjectType } from "type-graphql";
import { User } from './User';
import { Upvote } from './Upvote';

//import { Comment } from './Comment'

@ObjectType() // This class is an object type of graphql
@Entity() // Entity decorator corresponds to a database table
export class Post extends BaseEntity { // BaseEntity allows use to run commands related to SQL
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({ type: 'int', default: 0 })
    points!: number;

    @Field(() => Int, { nullable: true })
    voteStatus: number | null; // 1 or -1 or null(not voted)

    @Field()
    @Column()
    creatorId: number; // foreign key for posts

    @Field()
    @ManyToOne(() => User, user => user.posts)
    creator: User;

    @OneToMany(() => Upvote, upvote => upvote.post)
    upvotes: Upvote[];

    @Field(() => String) // field decorator exposes this db column to our graphql schema
    @CreateDateColumn() // Property decorator represents that its a db column
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;



    // @OneToMany(() => Comment, comment => comment.creator)
    // comments: Comment[];
}