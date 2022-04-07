// import {
//   Link as ChakraLink,
//   Text,
//   Code,
//   List,
//   ListIcon,
//   ListItem,
// } from '@chakra-ui/react'
// import { CheckCircleIcon, LinkIcon } from '@chakra-ui/icons'

// import { Hero } from '../components/Hero'
// import { Container } from '../components/Container'
// import { Main } from '../components/Main'
// import { DarkModeSwitch } from '../components/DarkModeSwitch'
// import { CTA } from '../components/CTA'  
// import { Footer } from '../components/Footer'
import { Box, Button, Flex, Heading, Link, Stack, Text, Spinner } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { Layout } from '../components/Layout';
import { Post, PostsQuery, usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import { useState } from 'react';
import { UpvoteSection } from '../components/UpvoteSection';
import { EditDeletePostButtons } from '../components/EditDeletePostButtons';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 15, 
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
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
          {data!.posts.posts.map((p) => 
            !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpvoteSection post={p} />
                <Box flex={1}>
                  {/* Link will make the header clickable and NextLink will allow user to navigate to the post details. */}
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link _hover={{ color:"gray.400" }} style={{ textDecoration: 'none' }}>
                      <Heading fontSize="xl">{p.title}</Heading>
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

       {data && data.posts.hasMore ? (
        <Flex>
          <Button 
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
              });
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
  
    // <Container height="100vh">
    //   <Hero />
    //   <Main>
    //     <Text>
    //       Example repository of <Code>Next.js</Code> + <Code>chakra-ui</Code> +{' '}
    //       <Code>TypeScript</Code>.
    //     </Text>
  
    //     <List spacing={3} my={0}>
    //       <ListItem>
    //         <ListIcon as={CheckCircleIcon} color="green.500" />
    //         <ChakraLink
    //           isExternal
    //           href="https://chakra-ui.com"
    //           flexGrow={1}
    //           mr={2}
    //         >
    //           Chakra UI <LinkIcon />
    //         </ChakraLink>
    //       </ListItem>
    //       <ListItem>
    //         <ListIcon as={CheckCircleIcon} color="green.500" />
    //         <ChakraLink isExternal href="https://nextjs.org" flexGrow={1} mr={2}>
    //           Next.js <LinkIcon />
    //         </ChakraLink>
    //       </ListItem>
    //     </List>
    //   </Main>
  
    //   <DarkModeSwitch />
    //   <Footer>
    //     <Text>Next ❤️ Chakra</Text>
    //   </Footer>
    //   <CTA />
    // </Container>
  );

}

export default withApollo({ ssr: true })(Index); // this wraps the apollo provider around Index to use graphql. We also use SSR for the query.
