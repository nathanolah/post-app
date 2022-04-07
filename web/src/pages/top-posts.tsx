import { Box, Button, Flex, Heading, Link, Spinner, Stack, Text } from '@chakra-ui/react';
import { EditDeletePostButtons } from '../components/EditDeletePostButtons';
import { Layout } from '../components/Layout';
import { UpvoteSection } from '../components/UpvoteSection';
import { useTopPostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';
import NextLink from 'next/link';
import { useState } from 'react';

const TopPosts = () => {
    const [limitAmount, setLimitAmount] = useState(5);

    const { data, error, loading, fetchMore, variables } = useTopPostsQuery({
        variables: {
            limit: limitAmount
        },
        notifyOnNetworkStatusChange: true
    });

    if (!loading && !data) {
        return (
            <div>
                Failed to load any data.
                {error?.message}
            </div>
        );
    }

    return (
        <Layout>
            {!data && loading ? (
                <Flex align="center">
                    <Spinner m={'auto'} my={8} size='xl' />
                </Flex>
            ) : (
                <Stack spacing={8}>
                    {data!.topPosts.posts.map((p) => 
                        !p ? null : (
                            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                                <UpvoteSection post={p} />
                                <Box flex={1}>
                                {/* Link will make the header clickable and NextLink will allow user to navigate to the post details. */}
                                <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                                    <Link _hover={{ color:"gray.400" }} style={{ textDecoration: 'none' }}>
                                    <Heading fontSize="xl" >{p.title}</Heading>
                                    </Link>
                                </NextLink>
                                <Text>Posted by {p.creator.username}</Text>
                                <Flex align="center">
                                    <Text flex={1} mt={4}>{p.textSnippet}</Text>
                                    <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                                </Flex>
                                </Box>
                            </Flex>
                        )
                    )}
                </Stack>
            )}

            {data && data.topPosts.hasMore ? (
                <Flex>
                    <Button
                        onClick={() => {
                            fetchMore({
                                variables: {
                                    limit: variables?.limit
                                }
                            })
                            let amount = limitAmount
                            setLimitAmount(amount += 5);
                        }}
                        isLoading={loading}
                        m='auto'
                        my={8}
                    >
                        Load more
                    </Button>
                </Flex>
            ) : null }

        </Layout>
    );


}

export default withApollo({ ssr: true })(TopPosts);