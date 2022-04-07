import React from "react";
import { Formik, Form } from 'formik';
import { Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { MeDocument, MeQuery, useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withApollo } from "../utils/withApollo";

const Register = () => {
    const router = useRouter();
    const [register] = useRegisterMutation();

    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ email: "", username: "", password: ""}}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register({ 
                        variables: { options: values },
                        update: (cache, { data }) => { // getting the data which is the result of the register and we are putting it into the cache of the MeQuery.
                            cache.writeQuery<MeQuery>({
                                query: MeDocument,
                                data: { // use "Ctrl + Space" to get the autocompletion to fill the shape of the data.
                                    __typename: "Query",
                                    me: data?.register.user
                                }
                            });
                        }
                    });

                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors));
                    } else if (response.data?.register.user) {
                        // registered successfully
                        router.push('/'); // return back to home page
                    } 
                }}
            >
                {({ values, handleChange, isSubmitting }) => (
                    <Form>
                        <InputField
                            name="username"
                            placeholder="username"
                            label="Username"
                        />
                        <Box mt={4}>
                            <InputField 
                                name="email" 
                                placeholder="email" 
                                label="Email"
                            />
                        </Box>
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <Box mt={4}>
                            <Button 
                                type='submit' 
                                colorScheme='teal'
                                isLoading={isSubmitting}
                            >
                                Register
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

// in next.js we have to export default
export default withApollo({ ssr: false })(Register);
