import { createMessage } from "../services/databaseService.js";

export const sendMessage = async (message) => {
    try {
        // Logic to save the message to the database
        const savedMessage = await createMessage(message);
        return { success: true, message: savedMessage };
    } catch (error) {
        console.error("send message error:", error);
        const message = "Failed to send message: " + error;
        return { success: false, message: message };
    }
};
