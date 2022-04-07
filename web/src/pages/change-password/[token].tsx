import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { MeDocument, MeQuery, useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from 'next/link';
import { withApollo } from '../../utils/withApollo';

const ChangePassword: NextPage = () => {
    const router = useRouter();
    const [changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState("");  

    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({
                        variables: {
                            newPassword: values.newPassword,
                            token: (typeof router.query.token === 'string') ? router.query.token : '',
                        },
                        update: (cache, { data }) => {
                            cache.writeQuery<MeQuery>({ 
                                query: MeDocument,
                                data: { 
                                    __typename: "Query",
                                    me: data?.changePassword.user
                                }
                            });
                        }
                    });

                    if (response.data?.changePassword.errors) {
                        const errorMap = toErrorMap(response.data.changePassword.errors);
                        if ('token' in errorMap) {
                            setTokenError(errorMap.token); // pass in the error message for the token
                        }
                        
                        setErrors(errorMap);

                    } else if (response.data?.changePassword.user) {
                        // changed password successfully
                        router.push('/'); // return back to home page
                    } 
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="newPassword"
                            placeholder="New password"
                            label="New password"
                            type="password"
                        />
                        {tokenError ? (
                            <Flex>
                                <Box>
                                    <Box mr={2} color={'red'}>{tokenError}</Box>
                                    <NextLink href="/forgot-password">
                                        <Link>Reset password again</Link>
                                    </NextLink>
                                </Box>
                            </Flex>
                        ) : null}
                        <Button
                            mt={4} 
                            type='submit' 
                            colorScheme='teal'
                            isLoading={isSubmitting}
                        >
                            Change Password
                        </Button>
                        
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

// // This nextjs function allows us to pass any query parameters into the function
// ChangePassword.getInitialProps = ({query}) => {
//     return {
//         token: query.token as string,
//     }
// }

// urql client must be used for any mutations or queries to work
export default withApollo({ ssr: false })(ChangePassword);