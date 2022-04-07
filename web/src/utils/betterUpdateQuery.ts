import { Cache, QueryInput } from "@urql/exchange-graphcache";

// This function will allow to properly cast the types Result and Query
export function betterUpdateQuery<Result, Query>(
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query) {
    return cache.updateQuery(qi, data => fn(result, data as any) as any);
}
