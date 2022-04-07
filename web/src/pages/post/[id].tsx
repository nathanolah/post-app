import { Box, Flex, Heading, Spinner } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'; 
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { withApollo } from '../../utils/withApollo';

const Post = ({}) => {
    // const router = useRouter();
    // const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
    // const [{data, error, fetching}] = usePostQuery({
    //     pause: intId === -1, // this will pause the query if 'intId' is -1
    //     variables: {
    //         id: intId
    //     }
    // });

    const { data, error, loading } = useGetPostFromUrl();

    if (loading) {
        return (
            <Layout>
                <Flex align="center">
                    <Spinner m={'auto'} my={8} size='xl' />
                </Flex>
            </Layout>
        );
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>Could not find post</Box>
            </Layout>
        );
    }
    
    return ( 
        <Layout>
            <Heading mb={4}>{data?.post?.title}</Heading>
            <Box mb={4}>
                {data?.post?.text}
            </Box>
            <EditDeletePostButtons id={data?.post?.id} creatorId={data?.post?.creator.id} /> 
        </Layout>
    );
    

}

export default withApollo({ ssr: true })(Post);