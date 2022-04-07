import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

export const NavBar = () => {
    const router = useRouter();
    const [logout, { loading: logoutFetching }] = useLogoutMutation(); // "{loading: logoutFetching}" is to resolve the name conflict.
    const apolloClient = useApolloClient();
    const { data, loading } = useMeQuery({
        skip: isServer(),
    });

    let body = null;

    if (loading) {
        // data is loading
        body = null;
    } else if (!data?.me) {
        // user is not logged in
        body = (
            <>
                <NextLink href="/login">
                    <Link
                        mr={2}
                        _hover={{ color: "#58a6ff" }}
                        style={{ textDecoration: "none" }}
                    >
                        Login
                    </Link>
                </NextLink>
                <NextLink href="/register">
                    <Link
                        mr={2}
                        _hover={{ color: "#58a6ff" }}
                        style={{ textDecoration: "none" }}
                    >
                        Register
                    </Link>
                </NextLink>
            </>
        );
    } else {
        // user is logged in
        body = (
            <Flex align="center">
                <NextLink href="/create-post">
                    <Button as={Link} mr={4}>
                        Create post
                    </Button>
                </NextLink>
                <Box mr={2}>{data.me.username}</Box>
                <Button
                    onClick={async () => {
                        await logout();
                        await apolloClient.resetStore();
                        //router.reload();
                    }}
                    variant="link"
                    isLoading={logoutFetching} // this will disable the button while loading the logout
                    _hover={{ color: "#58a6ff" }}
                    style={{ textDecoration: "none" }}
                >
                    Logout
                </Button>
            </Flex>
        );
    }

    return (
        // Navbar
        <Flex
            zIndex={1}
            position="sticky"
            top={0}
            bg={"transparent"}
            backdropFilter="auto"
            backdropBlur="3px"
            p={4}
            boxShadow="xl"
        >
            <Flex flex={1} m="auto" align="center" maxW={800}>
                <NextLink href="/">
                    <Link
                        _hover={{ color: "#58a6ff" }}
                        style={{ textDecoration: "none" }}
                    >
                        <Heading as="h4">Bulletin board</Heading>
                    </Link>
                </NextLink>
                <Box ml={8}>
                    <NextLink href="/top-posts">
                        <Link
                            _hover={{ color: "#58a6ff" }}
                            style={{ textDecoration: "none" }}
                        >
                            <Heading as="h5" size="md">
                                Top Posts
                            </Heading>
                        </Link>
                    </NextLink>
                </Box>
                {/* <Box ml={4}>
                    <NextLink href="/top-posts">
                        <Link _hover={{ color:"#58a6ff" }} style={{ textDecoration: 'none' }}>
                        <Heading as='h5' size='md'>Latest Posts</Heading>
                        </Link>
                    </NextLink>
                </Box> */}
                <Box ml={"auto"}>{body}</Box>
                <Box>
                    <ColorModeSwitcher />
                </Box>
            </Flex>
        </Flex>
    );
};
