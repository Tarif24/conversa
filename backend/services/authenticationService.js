import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const generateAccessToken = user => {
    return jwt.sign({ userId: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};

export const generateRefreshToken = user => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const generateAdminToken = user => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
        },
        process.env.ADMIN_TOKEN_SECRET,
        { expiresIn: process.env.ADMIN_TOKEN_EXPIRY }
    );
};

export const verifyAccessToken = token => {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = token => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        return null;
    }
};

export const verifyAdminToken = token => {
    try {
        return jwt.verify(token, process.env.ADMIN_TOKEN_SECRET);
    } catch (error) {
        return null;
    }
};

export const hashPassword = async password => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

export const validatePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
