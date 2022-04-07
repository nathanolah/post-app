import React from "react";
import { Formik, Form } from 'formik';
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import { withApollo } from "../utils/withApollo";

const Login = () => {
    const router = useRouter();
    const [login] = useLoginMutation();

    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ usernameOrEmail: "", password: ""}}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login({ 
                        variables: values,
                        update: (cache, { data }) => {
                            cache.writeQuery<MeQuery>({ // getting the data which is the result of the login and we are putting it into the cache of the MeQuery.
                                query: MeDocument,
                                data: { // use "Ctrl + Space" to get the autocompletion to fill the shape of the data.
                                    __typename: "Query",
                                    me: data?.login.user,
                                }
                            });
                            cache.evict({ fieldName: "posts:{}" });
                        }
                    });

                    if (response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if (response.data?.login.user) {
                        // logged in successfully
                        
                        if (typeof router.query.next === 'string') {
                            router.push(router.query.next); // navigate to the query parameter
                        } else {
                            router.push('/'); // navigate to the home page
                        }
                    } 
                }}
            >
                {({ values, handleChange, isSubmitting }) => (
                    <Form>
                        <InputField
                            name="usernameOrEmail"
                            placeholder="username or email"
                            label="Username or Email"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <Flex mt={2}>
                            <NextLink href="/forgot-password">
                                <Link ml='auto'>Forgot password?</Link>
                            </NextLink>
                        </Flex>
                        <Box mt={4}>
                            <Button 
                                type='submit' 
                                colorScheme='teal'
                                isLoading={isSubmitting}
                            >
                                Login
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

// in next.js we have to export default
export default withApollo({ ssr: false })(Login);
