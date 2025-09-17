import {
    doesUserExist,
    createNewUser,
} from "../services/authenticationService.js";

export const signup = async (user) => {
    try {
        console.log("Signup attempt for user: ");

        const userExists = await doesUserExist(user);
        if (userExists.success && !userExists.exists) {
            const newUser = await createNewUser(user);
        }

        return { success: true };
    } catch (error) {
        console.error("sign up error:", error);
        return { success: false, error: "Failed to sign up" };
    }
};
