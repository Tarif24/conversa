import crypto from 'crypto';
import { getMessageById } from './databaseService.js';

const CRYPTO_KEY = Buffer.from(process.env.CRYPTO_KEY, 'hex');

export const encryptMessage = plaintext => {
    // Generate a random IV (initialization vector) for each encryption
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', CRYPTO_KEY, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

    const authTag = cipher.getAuthTag();

    return {
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
    };
};

export const decryptMessage = encryptedData => {
    const encrypted = Buffer.from(encryptedData.encrypted, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', CRYPTO_KEY, iv);
    decipher.setAuthTag(authTag);

    return decipher.update(encrypted, null, 'utf8') + decipher.final('utf8');
};

export const addReplyInfo = async message => {
    if (!message.replyToId) {
        return message;
    }

    const parentMessage = await getMessageById(message.replyToId);

    if (!parentMessage || parentMessage.isDeleted) {
        // Parent is deleted
        return {
            ...message,
            replyTo: {
                messageId: message.replyToId,
                isDeleted: true,
                content: '[Deleted Message]',
            },
        };
    }

    // Parent exists
    return {
        ...message,
        replyTo: {
            messageId: parentMessage._id,
            username: parentMessage.username,
            content: parentMessage.content,
            createdAt: parentMessage.createdAt,
            isDeleted: false,
        },
    };
};

export const populateReplyInfo = async messages => {
    return await Promise.all(messages.map(msg => addReplyInfo(msg)));
};
