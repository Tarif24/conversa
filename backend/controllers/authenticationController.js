import {
    doesUserExist,
    createNewUser,
} from "../services/authenticationService.js";
import { createUser, getUserByEmail } from "../services/databaseService.js";

export const signup = async (user) => {
    try {
        console.log("Signup attempt for user: ", user);

        const userExists = await getUserByEmail(user.email);
        if (!userExists.exists) {
            const newUser = await createUser(user);
            return { success: true, user: newUser };
        }

        return { success: false, error: "User already exists" };
    } catch (error) {
        console.error("sign up error:", error);
        return { success: false, error: "Failed to sign up" };
    }
};
