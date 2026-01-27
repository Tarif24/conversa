import crypto from 'crypto';
import { getMessageById, createMessage, updateRoomLastMessage } from './databaseService.js';

const CRYPTO_KEY = Buffer.from(process.env.CRYPTO_KEY, 'hex');

export const encryptMessage = plaintext => {
    // Generate a random IV (initialization vector) for each encryption
    const iv = crypto.randomBytes(12);
    // Creates a unique cipher with the randomIV and the secret crypto key
    const cipher = crypto.createCipheriv('aes-256-gcm', CRYPTO_KEY, iv);
    // Encrypts the message withe unique cipher
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    // An auth tag is made to ensure that the unencrypted text is the same as it was before encryption and no alterations were made
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

    // Decrypts the message with the unique IV and secret key
    const decipher = crypto.createDecipheriv('aes-256-gcm', CRYPTO_KEY, iv);
    // Checks if the message was unaltered
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

    // Decrypt the parents message
    const decryptedMessage = decryptMessage({
        encrypted: parentMessage.message,
        iv: parentMessage.iv,
        authTag: parentMessage.authTag,
    });

    // Parent exists
    return {
        ...message,
        replyTo: {
            messageId: parentMessage._id,
            username: parentMessage.username,
            content: decryptedMessage,
            createdAt: parentMessage.createdAt,
            isDeleted: false,
        },
    };
};

export const populateReplyInfo = async messages => {
    // Adds the reply info to an array of messages
    return await Promise.all(messages.map(msg => addReplyInfo(msg)));
};

export const newSystemMessage = async (roomId, systemMessage) => {
    const encryptedData = encryptMessage(systemMessage);

    const message = {
        userId: 'system',
        roomId: roomId,
        username: 'system',
        message: encryptedData.encrypted,
        iv: encryptedData.iv,
        authTag: encryptedData.authTag,
    };

    const initialMessage = await createMessage(message);

    await updateRoomLastMessage(roomId, initialMessage);
};
