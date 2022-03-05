import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType() // This class is an object type of graphql
@Entity() // Entity decorator corresponds to a database table
export class Post {
    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    @Field(() => String) // field decorator exposes this db column to our graphql schema
    @Property({ type: 'date' }) // Property decorator represents that its a db column
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date();
    
    @Field()
    @Property({type: 'text'})
    title!: string;
}