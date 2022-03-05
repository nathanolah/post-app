import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
    @Query(() => String) // uppercase 'String' in type-graphql
    hello() {
        return 'hello world';
    }

    @Query(() => String)
    bye() {
        return 'bye';
    }

}