import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps { 
    id: number,
    creatorId: number
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({id, creatorId}) => {

    const [{ data: meData }] = useMeQuery();
    const [, deletePost] = useDeletePostMutation();

    if (!meData) {
        return null;
    }

    if (meData.me?.id !== creatorId) {
        return null;
    }

    return (
        <Box ml="auto">
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
                deletePost({ id })
            }}
            />
        </Box>
    );
    
}