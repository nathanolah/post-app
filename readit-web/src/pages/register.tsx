import React from "react";
import { Formik, Form } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";

const Register = () => {
    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ username: "", password: ""}}
                onSubmit={(values) => {
                    console.log(values)
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
export default Register;