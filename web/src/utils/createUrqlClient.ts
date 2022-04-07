import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from "urql";
import { gql } from '@urql/core';
import { 
  LogoutMutation, 
  MeQuery, 
  MeDocument, 
  LoginMutation, 
  RegisterMutation,
  VoteMutationVariables, 
  DeletePostMutationVariables
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache';
import { pipe, tap } from 'wonka';
import Router from 'next/router';
import { isServer } from "./isServer";

const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('user is not authenticated')) {
        Router.replace('/login');
      }
    })
  );
};

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);

    //console.log('allFields : ', allFields);

    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    // const isItInTheCache = cache.resolve(entityKey, fieldKey);
    const isItInTheCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      'posts'
    );

    info.partial = !isItInTheCache;

    let hasMore = true;
    const results: string[] = [];

    // Reads the data from the cache and returning it
    // check if the data is in the cache and return it from the cache
    // fieldInfos will load more posts for each pagination
    fieldInfos.forEach(fi => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore');

      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }

      results.push(...data); // combines each pagination into the list of results
    });

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results
    }

  };
};

const invalidateAllPosts = (cache: Cache) => {
  // loop over all the paginated queries in the list and invalidate all of them
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter(
    (info) => info.fieldName === "posts"
  );
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", "posts", fi.arguments || {});
  });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => { 
  let cookie = '';

  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }
  
  return {
    url: process.env.NEXT_PUBLIC_API_URL as string,
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? { cookie, } : undefined
    },
    exchanges: [
      dedupExchange, 
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          }
        },
        // update the cache - URQL cache updates
        updates: {
          Mutation: {
            deletePost: (_result, args, cache, info) => {
                cache.invalidate({ __typename: "Post",
                id: (args as DeletePostMutationVariables).id
              });
            },
            vote: (_result, args, cache, info) => {
              const { postId, value } = args as VoteMutationVariables;
              // reading the fragment 
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              ); // Data or null

              if (data) {
                // if voted and vote is not being changed to opposite vote status we ignore
                if (data.voteStatus === value) {
                  return;
                }

                const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value; 

                // update the new fragment
                cache.writeFragment(
                  gql`
                    fragment _ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value } as any
                );

              }

            },
            createPost: (_result, args, cache, info) => {
              // loop over all the paginated queries in the list and invalidate all of them
              invalidateAllPosts(cache);

              // invalid the query and refetch it from the server
              // cache.invalidate('Query', 'posts', {
              //     limit: 15
              // })
            },
            logout: (_result, args, cache, info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              ); 
            },
            login: (_result, args, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    }
                  }
                }
              );
              invalidateAllPosts(cache);
            },
            register: (_result, args, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    }
                  }
                }
              )
            },
          },
        }
      }),
      errorExchange,
      ssrExchange,
      fetchExchange],
  } 
};