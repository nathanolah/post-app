import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote";

// we will pass in [{postId: 5, userId: 10}]
// return the upvote which is {postId: 5, userId: 10, value: 1}
export const createUpvoteLoader = () => new DataLoader<{ postId: number, userId: number }, Upvote | null>(
    async (keys) => {
        // fetch the users by userIds
        const upvotes = await Upvote.findByIds(keys as any);

        const upvoteIdsToUpvote: Record<string, Upvote> = {};

        upvotes.forEach((upvote) => {
            upvoteIdsToUpvote[`${upvote.userId}|${upvote.postId}`] = upvote;
        });

        return keys.map((key) => upvoteIdsToUpvote[`${key.userId}|${key.postId}`]);
    }
);