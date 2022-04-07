import { ApolloClient, from, HttpLink, InMemoryCache } from "@apollo/client";
import { withApollo as createWithApollo } from "next-apollo";
import { PaginatedPosts } from "../generated/graphql";
import { NextPageContext } from "next";
import { onError } from "@apollo/client/link/error";
import Router from "next/router";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL as string,
  credentials: 'include',
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {

      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);

      if (message === 'user is not authenticated') {
        Router.replace('/login');
      }
    });
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }

});

const createClient = (ctx?: NextPageContext) => new ApolloClient({
    //link: from([errorLink, httpLink]),
    uri: process.env.NEXT_PUBLIC_API_URL as string,
    credentials: 'include',
    headers: {
        cookie: (typeof window === "undefined" ? ctx?.req?.headers.cookie : undefined) || ""
    },
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: { // posts query from graphql
              keyArgs: [],
              merge(existing: PaginatedPosts | undefined, incoming: PaginatedPosts): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts]
                };
              },
            },
            topPosts: { // topPosts query from graphql
              keyArgs: [],
              merge(existing: PaginatedPosts | undefined, incoming: PaginatedPosts): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts]
                }
              }
            }
          },
        },
      }, 
    })
  });

export const withApollo = createWithApollo(createClient);