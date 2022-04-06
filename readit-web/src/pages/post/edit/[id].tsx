import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { usePostQuery, useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";
import { withApollo } from "../../../utils/withApollo";

const EditPost = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const {data, loading} = usePostQuery({
        skip: intId === -1, // this will pause the query if 'intId' is -1
        variables: {
            id: intId
        }
    });
    const [updatePost] = useUpdatePostMutation();

    if (loading) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        );
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>Could not find post</Box>
            </Layout>
        );
    }

    return (
        <Layout variant='small'>
            <Formik
                initialValues={{ title: data.post.title, text: data.post.text }}
                onSubmit={async (values, { setErrors }) => {
                  
                    await updatePost({ variables: { id: intId, ...values } });
                    router.back();
                    // router.push('/');                    

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
                                Edit Post
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withApollo({ ssr: false })(EditPost);