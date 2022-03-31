import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { useRouter } from 'next/router';

export const NavBar = () => {
    const router = useRouter();
    const [{fetching: logoutFetching}, logout] = useLogoutMutation(); // "{fetching: logoutFetching}" is to resolve the name conflict.
    const [{data, fetching}] = useMeQuery({
        pause: isServer(),
    }); // fetching is for loading

    let body = null;

    if (fetching) {
        // data is loading
        body = null;
    } else if (!data?.me) {
        // user is not logged in
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link mr={2}>Register</Link>
                </NextLink>
            </>
        )
    } else {
        // user is logged in
        body = (
            <Flex align="center">
                <NextLink href='/create-post'>
                    <Button as={Link} mr={4}>
                        Create post
                    </Button>
                </NextLink>
                <Box mr={2}>{data.me.username}</Box>
                <Button
                    onClick={async () => {
                        await logout();
                        router.reload();
                    }} 
                    variant="link"
                    isLoading={logoutFetching} // this will disable the button while loading the logout
                >
                    Logout
                </Button>
            </Flex>
        )
    }

    return (
        // Navbar 
        <Flex zIndex={1} position='sticky' top={0} bg={'#1A365D'} p={4}>
            <Flex flex={1} m="auto" align="center" maxW={800}>
                <NextLink href="/">
                    <Link>
                        <Heading>post-app</Heading>
                    </Link>
                </NextLink>
                <Box ml={'auto'}>{ body }</Box>
            </Flex>
        </Flex>
    );
}