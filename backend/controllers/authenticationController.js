import {
    createUser,
    getUserByEmail,
    getUserByUsername,
    createRefreshToken,
    getRefreshToken,
    deleteRefreshToken,
    deleteRefreshTokensByUserId,
    getAllRoomsForUser,
} from '../services/databaseService.js';
import {
    generateAccessToken,
    generateRefreshToken,
    hashPassword,
    validatePassword,
    verifyRefreshToken,
} from '../services/authenticationService.js';

export const signup = async user => {
    try {
        const emailExists = await getUserByEmail(user.email);
        const usernameExists = await getUserByUsername(user.username);

        // Checks if the user already exists or if its an invalid username
        if (emailExists || usernameExists || user.username.toLowerCase() === 'system') {
            return {
                success: false,
                message: 'User already exists signup failed',
                exists: true,
            };
        }

        // Passwords are hashed before DB storage
        const hashedPassword = await hashPassword(user.password);

        const finalUser = {
            ...user,
            password: hashedPassword,
        };

        const newUser = await createUser(finalUser);

        // Creating JWT tokens for user and adding the refresh token to the DB
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
            message: 'Signup successful',
        };
    } catch (error) {
        console.error('Controller Sign up error:', error);
        const message = 'Failed to sign up user: ' + error;
        return { success: false, message: message };
    }
};

export const login = async user => {
    try {
        // Need to check if user exists by verifying if the email exists
        const emailExists = await getUserByEmail(user.email);
        if (!emailExists) {
            return {
                success: false,
                user: emailExists,
                exists: false,
                message: 'Login failed user does not exist',
            };
        }

        const existingUser = await getUserByEmail(user.email);

        const validPassword = await validatePassword(user.password, existingUser.password);

        if (!validPassword) {
            return {
                success: false,
                message: 'password incorrect login failed',
                exists: true,
            };
        }

        // After credentials are confirmed old refresh tokens are deleted and a new set of tokens are given and the refresh token is once again saved to the DB
        await deleteRefreshTokensByUserId(existingUser._id);

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
            message: 'Login successful',
            exists: true,
        };
    } catch (error) {
        console.error('Controller Login error:', error);
        const message = 'Failed to login user: ' + error;
        return { success: false, message: message };
    }
};

export const logout = async (tokenData, userId) => {
    try {
        // Deletes all user refresh tokens
        await getRefreshToken(tokenData);
        await deleteRefreshTokensByUserId(userId);

        return { success: true, message: 'Logout successful', userId: userId };
    } catch (error) {
        console.error('Controller Logout error:', error);
        const message = 'Failed to logout: ' + error;
        return { success: false, message: message };
    }
};

export const refreshToken = async tokenData => {
    try {
        const existingToken = await getRefreshToken(tokenData.token);

        // Checks if a token was sent
        if (!existingToken) {
            return {
                success: false,
                message: 'Refresh token not found',
            };
        }

        // Verifies the token sends another accesstoken if everything is verified
        const decoded = verifyRefreshToken(tokenData.token);
        if (!decoded) {
            // Remove invalid token
            await deleteRefreshToken(tokenData.token);
            return {
                success: false,
                message: 'Invalid refresh token',
            };
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({
            _id: decoded.userId,
            email: decoded.email,
        });

        return {
            success: true,
            accessToken: newAccessToken,
            message: 'Token refreshed successfully',
        };
    } catch (error) {
        console.error('Controller Refresh Token error:', error);
        const message = 'Failed to Refresh Token: ' + error;
        return { success: false, message: message };
    }
};

export const getAllUserRooms = async userId => {
    try {
        const result = await getAllRoomsForUser(userId);

        if (!result) {
            return {
                success: false,
                message: 'Could not retrieve user rooms',
            };
        }

        return {
            success: true,
            rooms: result,
            message: 'User rooms retrieved successfully',
        };
    } catch (error) {
        console.error('Get all user rooms error:', error);
        const message = 'Failed to get user rooms: ' + error;
        return { success: false, message: message };
    }
};
