import { ApolloCache } from "@apollo/client";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useMeQuery, useVoteMutation, VoteMutation } from "../generated/graphql";
import gql from "graphql-tag";
import Router from "next/router";
import { isServer } from "../utils/isServer";

interface UpvoteSectionProps {
    post: PostSnippetFragment; // pass in the post object from the post query (post snippet)
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<VoteMutation>) => {
    const data = cache.readFragment<{ 
        id: number,
        points: number,
        voteStatus: number | null
    }>({
        id: "Post:" + postId,
        fragment: gql`
            fragment _ on Post {
                id
                points
                voteStatus
            }
        `,
    });

    if (data) {
         // if voted and vote is not being changed to opposite vote status we ignore
        if (data.voteStatus === value) {
            return;
        }

        const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value;

        // update the fragment
        cache.writeFragment({
            id: "Post:" + postId,
            fragment: gql`
                fragment _ on Post {
                    points
                    voteStatus
                }
            `,
            data: { points: newPoints, voteStatus: value },
        });
    }

}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<"upvote-loading" | "downvote-loading" | "not-loading">("not-loading");
    const [vote] = useVoteMutation();

    const { data, loading } = useMeQuery({
        skip: isServer(),
    });

    let color = "";
    if (post.points > 0) {
        color = '#089981'; // green
    } else if (post.points < 0) {
        color = '#f23645'; // red
    }

    return (
        <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
            <IconButton
                onClick={async () => {
                    
                    if (!data?.me) {
                        console.log('not logged in account')
                        Router.replace('/login');
                    } else {
                        if (post.voteStatus === 1) {
                            return;
                        }
                        setLoadingState("upvote-loading"); // set loading state
                        await vote({ // await for loading to complete
                            variables: {
                                postId: post.id,
                                value: 1,
                            },
                            update: (cache) => updateAfterVote(1, post.id, cache),
                        });
                        setLoadingState("not-loading"); // set back to not loading
                    }

                }}
                colorScheme={post.voteStatus === 1 ? "green" : undefined}
                isLoading={loadingState === "upvote-loading"} 
                aria-label="Up vote post" 
                icon={<ChevronUpIcon boxSize="24px"/>}
            />
            <Text color={color} fontSize="md" fontWeight='bold'>
                {post.points}
            </Text>
            <IconButton
                onClick={async () => {

                    if (!data?.me) {
                        console.log('not logged in account')
                        Router.replace('/login');
                    } else {
                        if (post.voteStatus === -1) {
                            return;
                        }
                        setLoadingState("downvote-loading");
                        vote({
                            variables: {
                                postId: post.id,
                                value: -1,
                            },
                            update: (cache) => updateAfterVote(-1, post.id, cache),
                        });
                        setLoadingState("not-loading");
                    }


                }}
                colorScheme={post.voteStatus === -1 ? "red" : undefined}
                isLoading={loadingState === "downvote-loading"}  
                aria-label="Down vote post" 
                icon={<ChevronDownIcon boxSize="24px"/>} 
            />
        </Flex>
    );
}