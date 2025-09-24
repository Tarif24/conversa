import {
    doesUserExist,
    createNewUser,
} from "../services/authenticationService.js";
import {
    createUser,
    getUserByEmail,
    getUserByUsername,
} from "../services/databaseService.js";

export const signup = async (user) => {
    try {
        console.log("Signup attempt for user: ", user.email);

        const emailExists = await getUserByEmail(user.email);
        const usernameExists = await getUserByUsername(user.username);
        if (!emailExists.exists && !usernameExists.exists) {
            const newUser = await createUser(user);
            return {
                success: true,
                user: newUser,
                message: "Signup successful",
            };
        }

        return {
            success: false,
            message: "User already exists signup failed",
            exist: true,
        };
    } catch (error) {
        console.error("sign up error:", error);
        const message = "Failed to sign up user: " + error;
        return { success: false, message: message };
    }
};

export const login = async (user) => {
    try {
        console.log("Login attempt for user: ", user.email);

        const emailExists = await getUserByEmail(user.email);
        if (!emailExists.exists) {
            const newUser = await createUser(user);
            return {
                success: false,
                user: newUser,
                exist: false,
                message: "Login failed user does not exist",
            };
        }

        const existingUser = (await getUserByEmail(user.email)).user;

        if (existingUser.password === user.password) {
            return {
                success: true,
                user: existingUser,
                message: "Login successful",
            };
        }

        return {
            success: false,
            message: "password incorrect login failed",
            exist: true,
        };
    } catch (error) {
        console.error("login up error:", error);
        const message = "Failed to login user: " + error;
        return { success: false, message: message };
    }
};
