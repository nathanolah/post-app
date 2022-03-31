import { Box, Flex, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const ForgotPassword = () => {
    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation(); 
    
    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    if (!values.email) {
                        setComplete(false);
                    } else {
                        await forgotPassword(values);
                        setComplete(true);
                    }
                }}
            >
                {({ isSubmitting }) => 
                    complete ? (
                        <Box>
                            An email has been sent.
                        </Box>
                    ) : (
                        <Form>
                            <InputField
                                name="email"
                                placeholder="email"
                                label="Email"
                                type="email"
                            />
                            <Box mt={4}>
                                <Button 
                                    type='submit' 
                                    colorScheme='teal'
                                    isLoading={isSubmitting}
                                >
                                    Forgot password
                                </Button>
                            </Box>
                        </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);