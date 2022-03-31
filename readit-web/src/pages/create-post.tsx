import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost = () => {
    const router = useRouter();
    useIsAuth();
    const [, createPost] = useCreatePostMutation(); 

    return(
        <Layout variant='small'>
            <Formik
                initialValues={{ title: "", text: ""}}
                onSubmit={async (values, { setErrors }) => {
                    
                    // TO DO : validate the values. Check for empty strings

                    const response = await createPost({input: values});
                    if (!response.error) {
                        router.push('/');
                    }

                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="title"
                            placeholder="title"
                            label="Title"
                        />
                        <Box mt={4}>
                            <InputField
                                textarea
                                name="text"
                                placeholder="enter your text..."
                                label="Body"
                            />
                        </Box>
                        <Box mt={4}>
                            <Button 
                                type='submit' 
                                colorScheme='teal'
                                isLoading={isSubmitting}
                            >
                                Create Post
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost);