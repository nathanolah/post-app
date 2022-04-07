import DataLoader from "dataloader";
import { User } from "../entities/User";

// We will pass in user ids to the user dataloader and it will return user objects.  
export const createUserLoader = () => new DataLoader<number, User>(async (userIds) => {
    // fetch the users by userIds
    const users = await User.findByIds(userIds as number[]);

    const userIdsToUser: Record<number, User> = {};

    users.forEach((user) => {
        userIdsToUser[user.id] = user;
    });

    const sortedUsers = userIds.map((userId) => userIdsToUser[userId]);

    // returns the Record of users
    return sortedUsers;
});