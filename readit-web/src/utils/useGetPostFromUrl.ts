import { usePostQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetPostFromUrl = () => {
    const intId = useGetIntId();
    return usePostQuery({
        pause: intId === -1, // this will pause the query if 'intId' is -1
        variables: {
            id: intId
        }
    });
}