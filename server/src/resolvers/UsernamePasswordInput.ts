import { InputType, Field } from "type-graphql";

// input type is what we input into the mutations

@InputType()
export class UsernamePasswordInput {
    @Field()
    email: string;
    @Field()
    username: string;
    @Field()
    password: string;
}
