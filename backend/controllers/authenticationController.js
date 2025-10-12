import {
    createUser,
    getUserByEmail,
    getUserByUsername,
    createRefreshToken,
    getRefreshToken,
    deleteRefreshToken,
    deleteRefreshTokensByUserId,
} from "../services/databaseService.js";
import {
    generateAccessToken,
    generateRefreshToken,
    hashPassword,
    validatePassword,
    verifyRefreshToken,
} from "../services/authenticationService.js";

export const signup = async (user) => {
    try {
        console.log("Signup attempt for user: ", user.email);

        const emailExists = await getUserByEmail(user.email);
        const usernameExists = await getUserByUsername(user.username);

        if (emailExists.exists || usernameExists.exists) {
            return {
                success: false,
                message: "User already exists signup failed",
                exists: true,
            };
        }

        const hashedPassword = await hashPassword(user.password);

        const finalUser = {
            ...user,
            password: hashedPassword,
        };

        const newUser = await createUser(finalUser);

        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        await createRefreshToken({
            token: refreshToken,
            userId: newUser._id,
        });

        return {
            success: true,
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: newUser,
            message: "Signup successful",
        };
    } catch (error) {
        console.error("Controller Sign up error:", error);
        const message = "Failed to sign up user: " + error;
        return { success: false, message: message };
    }
};

export const login = async (user) => {
    try {
        console.log("Login attempt for user: ", user.email);

        const emailExists = await getUserByEmail(user.email);
        if (!emailExists.exists) {
            return {
                success: false,
                user: emailExists.user,
                exists: false,
                message: "Login failed user does not exist",
            };
        }

        const existingUser = (await getUserByEmail(user.email)).user;

        const validPassword = await validatePassword(
            user.password,
            existingUser.password
        );

        if (!validPassword) {
            return {
                success: false,
                message: "password incorrect login failed",
                exists: true,
            };
        }

        const accessToken = generateAccessToken(existingUser);
        const refreshToken = generateRefreshToken(existingUser);

        await createRefreshToken({
            token: refreshToken,
            userId: existingUser._id,
        });

        return {
            success: true,
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: existingUser,
            message: "Login successful",
            exists: true,
        };
    } catch (error) {
        console.error("Controller Login error:", error);
        const message = "Failed to login user: " + error;
        return { success: false, message: message };
    }
};

export const logout = async (tokenData) => {
    try {
        const token = await getRefreshToken(tokenData.token);
        await deleteRefreshTokensByUserId(token.userId);

        return { success: true, message: "Logout successful" };
    } catch (error) {
        console.error("Controller Logout error:", error);
        const message = "Failed to logout: " + error;
        return { success: false, message: message };
    }
};

export const refreshToken = async (tokenData) => {
    try {
        const existingToken = await getRefreshToken(tokenData.token);

        if (!existingToken.exists) {
            return {
                success: false,
                message: "Refresh token not found",
            };
        }

        const decoded = verifyRefreshToken(tokenData.token);
        if (!decoded) {
            // Remove invalid token
            await deleteRefreshToken(tokenData.token);
            return callback({
                success: false,
                message: "Invalid refresh token",
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({
            id: decoded.userId,
            email: decoded.email,
        });

        return {
            success: true,
            accessToken: newAccessToken,
            message: "Token refreshed successfully",
        };
    } catch (error) {
        console.error("Controller Refresh Token error:", error);
        const message = "Failed to Refresh Token: " + error;
        return { success: false, message: message };
    }
};
