// import { Field, Int } from "type-graphql";
// import { BaseEntity, Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
// import { User } from "./User";


//export class Comment extends BaseEntity {
    // @Field(() => Int)
    // @PrimaryGeneratedColumn()
    // id!: number;

    // @Field()
    // @Column()
    // text!: string;

    // @Field()
    // @Column()
    // creatorId: number; // foreign key for comments

    // // creator id user relationship
    // @Field()
    // @ManyToOne(() => User, user => user.comments)
    // creator: User;

    // // // replies many
    // // replies: Comment[];


    // @Field(() => String) // field decorator exposes this db column to our graphql schema
    // @CreateDateColumn() // Property decorator represents that its a db column
    // createdAt: Date;

    // @Field(() => String)
    // @UpdateDateColumn()
    // updatedAt: Date;
//}