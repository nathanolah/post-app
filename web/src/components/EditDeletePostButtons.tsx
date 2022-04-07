import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps { 
    id: number,
    creatorId: number
}

// Updating the cache after the mutation
// we call an update function on the mutation that we call

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({id, creatorId}) => {

    const { data: meData } = useMeQuery();
    const [deletePost] = useDeletePostMutation();
    let body = null;

    if (!meData) {
        return null;
    }

    if (meData.me?.id !== creatorId) {
        body = null;
    }

    if (meData.me?.username == 'admin') {
        body = (
            <IconButton
            // colorScheme="red" 
            aria-label="delete post" 
            icon={<DeleteIcon />}
            onClick={() => {
                deletePost({ 
                    variables: { id },
                    update: (cache) => {
                        cache.evict({ id: "Post:" + id });
                    },
                });
            }}
            />
        );
    }
    
    if (meData.me?.id === creatorId) {
        body = (
            <>
                <NextLink 
                href="/post/edit/[id]" 
                as={`/post/edit/${id}`}
                >
                <IconButton
                    as={Link}
                    mr={2}
                    aria-label="edit post" 
                    icon={<EditIcon />}
                />
                </NextLink>
                <IconButton
                // colorScheme="red" 
                aria-label="delete post" 
                icon={<DeleteIcon />}
                onClick={() => {
                    deletePost({ 
                        variables: { id }, 
                        update: (cache) => {
                            cache.evict({ id: "Post:" + id }); // removes the post from the cache
                        } 
                    });
                }}
                />   
            </>
        );
    }

    return (

        <Box ml="auto">
            { body }
        </Box>
    );
    
}